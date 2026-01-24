import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripeClient, getPlanFromPriceId } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import logger from "@/lib/logger";

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
 * Check if webhook event has already been processed (idempotency)
 */
async function isEventProcessed(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  eventId: string
): Promise<boolean> {
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
  supabase: ReturnType<typeof getSupabaseAdmin>,
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
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripeClient();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Webhook signature verification failed", err instanceof Error ? err : new Error(message));
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Idempotency check: skip if already processed
  const alreadyProcessed = await isEventProcessed(supabase, event.id);
  if (alreadyProcessed) {
    logger.info("Webhook event already processed, skipping", { eventId: event.id, eventType: event.type });
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
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
    // Mark event as failed (but still prevent reprocessing)
    await markEventProcessed(
      supabase,
      event.id,
      event.type,
      "failed",
      error instanceof Error ? error.message : "Unknown error"
    );
    logger.error("Webhook handler error", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    logger.error("No user ID in checkout session metadata");
    return;
  }

  // Get subscription details
  if (!session.subscription) {
    logger.error("No subscription in checkout session");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  if (!plan) {
    logger.error(`Unknown price ID: ${priceId}`);
    return;
  }

  // Update user plan
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

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;

  // If no user ID in metadata, try to find by subscription ID
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    targetUserId = user?.id;
  }

  if (!targetUserId) {
    logger.error("Could not find user for subscription:", subscription.id);
    return;
  }

  // Downgrade to free plan
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

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  subscription: Stripe.Subscription
) {
  // Handle plan changes (upgrades/downgrades)
  if (subscription.status !== "active") {
    return;
  }

  const userId = subscription.metadata?.supabase_user_id;

  let targetUserId = userId;

  if (!targetUserId) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    targetUserId = user?.id;
  }

  if (!targetUserId) {
    logger.error("Could not find user for subscription:", subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  if (!plan) {
    logger.error(`Unknown price ID: ${priceId}`);
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({ plan })
    .eq("id", targetUserId);

  if (error) {
    logger.error("Error updating user plan:", error);
    throw error;
  }

  logger.info(`User ${targetUserId} plan updated to ${plan}`);
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  stripe: Stripe,
  invoice: Stripe.Invoice
) {
  // Only handle subscription invoices (not one-time payments)
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionRef) {
    return;
  }

  // Get subscription ID (can be string or Subscription object)
  const subscriptionId = typeof subscriptionRef === "string"
    ? subscriptionRef
    : subscriptionRef.id;

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const userId = subscription.metadata?.supabase_user_id;

  let targetUserId = userId;

  if (!targetUserId) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    targetUserId = user?.id;
  }

  if (!targetUserId) {
    logger.error("Could not find user for invoice:", invoice.id);
    return;
  }

  // Reset monthly usage on successful payment
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
