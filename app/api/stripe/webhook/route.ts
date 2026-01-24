import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripeClient, getPlanFromPriceId } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import logger from "@/lib/logger";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

// Use service role key for webhook to bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for webhook");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Find user ID from metadata or by subscription ID lookup
 */
async function findUserIdBySubscription(
  supabase: SupabaseAdmin,
  subscriptionId: string,
  metadataUserId?: string
): Promise<string | null> {
  // First try metadata
  if (metadataUserId) {
    return metadataUserId;
  }

  // Fall back to database lookup
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  return user?.id ?? null;
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function isEventProcessed(supabase: SupabaseAdmin, eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("id", eventId)
    .single();

  return !!data;
}

/**
 * Mark webhook event as processed
 */
async function markEventProcessed(
  supabase: SupabaseAdmin,
  eventId: string,
  eventType: string,
  status: "processed" | "failed" = "processed",
  errorMessage?: string
): Promise<void> {
  await supabase.from("webhook_events").upsert({
    id: eventId,
    event_type: eventType,
    status,
    error_message: errorMessage,
    processed_at: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    logger.error("Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  const stripe = getStripeClient();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Webhook signature verification failed", err instanceof Error ? err : new Error(message));
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotency check: skip if already processed
  const alreadyProcessed = await isEventProcessed(supabase, event.id);
  if (alreadyProcessed) {
    logger.info("Webhook event already processed, skipping", { eventId: event.id, eventType: event.type });
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    logger.info("Processing webhook event", { eventType: event.type, eventId: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info("Checkout session data", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata,
        });
        await handleCheckoutCompleted(supabase, stripe, session);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, stripe, invoice);
        break;
      }

      default:
        logger.debug("Unhandled event type", { eventType: event.type });
    }

    // Mark event as successfully processed
    await markEventProcessed(supabase, event.id, event.type, "processed");
    logger.info("Webhook event processed", { eventId: event.id, eventType: event.type });

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Mark event as failed (but still prevent reprocessing)
    await markEventProcessed(
      supabase,
      event.id,
      event.type,
      "failed",
      errorMessage
    );
    logger.error("Webhook handler error", { message: errorMessage, stack: errorStack, error });
    return NextResponse.json({
      error: "Webhook handler failed",
      message: errorMessage,
      eventType: event.type,
      eventId: event.id,
    }, { status: 500 });
  }
}

async function handleCheckoutCompleted(
  supabase: SupabaseAdmin,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  logger.info("handleCheckoutCompleted started", { sessionId: session.id });

  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    logger.error("No user ID in checkout session metadata");
    return;
  }

  if (!session.subscription) {
    logger.error("No subscription in checkout session");
    return;
  }

  logger.info("Retrieving subscription from Stripe", { subscriptionId: session.subscription });

  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
    logger.info("Subscription retrieved", {
      id: subscription.id,
      status: subscription.status,
      itemsCount: subscription.items?.data?.length
    });
  } catch (subError) {
    logger.error("Failed to retrieve subscription", subError);
    throw subError;
  }

  // Access subscription items safely
  const firstItem = subscription.items?.data?.[0];
  if (!firstItem) {
    logger.error("No items in subscription", { subscriptionId: subscription.id });
    throw new Error("Subscription has no items");
  }

  const priceId = firstItem.price?.id;
  const priceAmount = firstItem.price?.unit_amount;

  logger.info("Subscription item details", { priceId, priceAmount });

  let plan = getPlanFromPriceId(priceId || "");

  // If plan lookup failed, try to determine from price amount as fallback
  if (!plan) {
    logger.warn(`Price ID lookup failed, trying amount-based detection`, {
      priceId,
      priceAmount,
      subscriptionId: subscription.id,
      userId,
      envStarter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || "(not set)",
      envPro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "(not set)",
    });

    // Fallback: Check by price amount (1900 = starter, 4900 = pro in cents)
    if (priceAmount === 1900) {
      plan = "starter";
      logger.info("Detected starter plan by price amount");
    } else if (priceAmount === 4900) {
      plan = "pro";
      logger.info("Detected pro plan by price amount");
    }
  }

  if (!plan) {
    logger.error(`Could not determine plan from price`, { priceId, priceAmount });
    // Still update stripe IDs so we can fix manually later
    await supabase
      .from("users")
      .update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
      })
      .eq("id", userId);
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({
      plan,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      conversions_used_this_month: 0,
      billing_cycle_start: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    logger.error("Error updating user plan:", error);
    throw error;
  }

  logger.info(`User ${userId} upgraded to ${plan}`);
}

async function handleSubscriptionDeleted(supabase: SupabaseAdmin, subscription: Stripe.Subscription) {
  const targetUserId = await findUserIdBySubscription(
    supabase,
    subscription.id,
    subscription.metadata?.supabase_user_id
  );

  if (!targetUserId) {
    logger.error("Could not find user for subscription:", subscription.id);
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({
      plan: "free",
      stripe_subscription_id: null,
    })
    .eq("id", targetUserId);

  if (error) {
    logger.error("Error downgrading user:", error);
    throw error;
  }

  logger.info(`User ${targetUserId} downgraded to free`);
}

async function handleSubscriptionUpdated(supabase: SupabaseAdmin, subscription: Stripe.Subscription) {
  if (subscription.status !== "active") {
    return;
  }

  const targetUserId = await findUserIdBySubscription(
    supabase,
    subscription.id,
    subscription.metadata?.supabase_user_id
  );

  if (!targetUserId) {
    logger.error("Could not find user for subscription:", subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  let plan = getPlanFromPriceId(priceId);

  // Fallback: Check by price amount if price ID lookup fails
  if (!plan) {
    const priceAmount = subscription.items.data[0]?.price.unit_amount;
    if (priceAmount === 1900) plan = "starter";
    else if (priceAmount === 4900) plan = "pro";

    if (plan) {
      logger.info(`Detected ${plan} plan by price amount in subscription update`);
    }
  }

  if (!plan) {
    logger.error(`Unknown price ID in subscription update: ${priceId}`);
    return;
  }

  const { error } = await supabase.from("users").update({ plan }).eq("id", targetUserId);

  if (error) {
    logger.error("Error updating user plan:", error);
    throw error;
  }

  logger.info(`User ${targetUserId} plan updated to ${plan}`);
}

async function handleInvoicePaid(supabase: SupabaseAdmin, stripe: Stripe, invoice: Stripe.Invoice) {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionRef) {
    return;
  }

  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const targetUserId = await findUserIdBySubscription(
    supabase,
    subscription.id,
    subscription.metadata?.supabase_user_id
  );

  if (!targetUserId) {
    logger.error("Could not find user for invoice:", invoice.id);
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({
      conversions_used_this_month: 0,
      billing_cycle_start: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    logger.error("Error resetting user usage:", error);
    throw error;
  }

  logger.info(`User ${targetUserId} usage reset after invoice payment`);
}
