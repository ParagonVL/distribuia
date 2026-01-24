import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, STRIPE_PRICES } from "@/lib/stripe";
import Stripe from "stripe";

/**
 * Diagnostic endpoint to verify Stripe configuration
 * Protected: Only accessible to authenticated users
 */
export async function GET(request: NextRequest) {
  const results: Record<string, { status: "ok" | "error" | "warning"; message: string; details?: unknown }> = {};

  // 1. Check authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized - must be authenticated to run diagnostics" },
      { status: 401 }
    );
  }

  // 2. Check environment variables
  const envChecks = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
  };

  results.environment = {
    status: Object.values(envChecks).every(Boolean) ? "ok" : "error",
    message: Object.values(envChecks).every(Boolean)
      ? "All required environment variables are set"
      : "Missing environment variables",
    details: {
      STRIPE_SECRET_KEY: envChecks.STRIPE_SECRET_KEY ? "✓ Set" : "✗ Missing",
      STRIPE_WEBHOOK_SECRET: envChecks.STRIPE_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY: envChecks.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || "✗ Missing",
      NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: envChecks.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "✗ Missing",
    },
  };

  // 3. Test Stripe API connectivity
  try {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve();
    results.stripe_connection = {
      status: "ok",
      message: "Successfully connected to Stripe API",
      details: {
        account_id: account.id,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      },
    };
  } catch (error) {
    results.stripe_connection = {
      status: "error",
      message: "Failed to connect to Stripe API",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  // 4. Verify price IDs are valid
  const stripe = getStripeClient();

  try {
    const starterPrice = await stripe.prices.retrieve(STRIPE_PRICES.starter_monthly);
    results.starter_price = {
      status: starterPrice.active ? "ok" : "warning",
      message: starterPrice.active
        ? "Starter price is valid and active"
        : "Starter price exists but is not active",
      details: {
        id: starterPrice.id,
        active: starterPrice.active,
        unit_amount: starterPrice.unit_amount,
        currency: starterPrice.currency,
        recurring: starterPrice.recurring,
      },
    };
  } catch (error) {
    results.starter_price = {
      status: "error",
      message: "Failed to retrieve Starter price",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    const proPrice = await stripe.prices.retrieve(STRIPE_PRICES.pro_monthly);
    results.pro_price = {
      status: proPrice.active ? "ok" : "warning",
      message: proPrice.active
        ? "Pro price is valid and active"
        : "Pro price exists but is not active",
      details: {
        id: proPrice.id,
        active: proPrice.active,
        unit_amount: proPrice.unit_amount,
        currency: proPrice.currency,
        recurring: proPrice.recurring,
      },
    };
  } catch (error) {
    results.pro_price = {
      status: "error",
      message: "Failed to retrieve Pro price",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  // 5. Check webhook endpoints in Stripe
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const activeWebhooks = webhooks.data.filter(w => w.status === "enabled");

    results.webhooks = {
      status: activeWebhooks.length > 0 ? "ok" : "warning",
      message: activeWebhooks.length > 0
        ? `Found ${activeWebhooks.length} active webhook endpoint(s)`
        : "No active webhook endpoints found",
      details: webhooks.data.map(w => ({
        id: w.id,
        url: w.url,
        status: w.status,
        enabled_events: w.enabled_events,
      })),
    };
  } catch (error) {
    results.webhooks = {
      status: "error",
      message: "Failed to list webhook endpoints",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  // 6. Check database table for webhook events (table not in generated types)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("webhook_events")
      .select("id, event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      results.webhook_events_table = {
        status: "error",
        message: "Failed to query webhook_events table",
        details: error.message,
      };
    } else {
      const events = data || [];
      results.webhook_events_table = {
        status: "ok",
        message: `webhook_events table accessible. Found ${events.length} recent events.`,
        details: {
          recent_events: events.map((e: { id: string; event_type: string; created_at: string }) => ({
            id: e.id,
            event_type: e.event_type,
            created_at: e.created_at,
          })),
        },
      };
    }
  } catch (error) {
    results.webhook_events_table = {
      status: "error",
      message: "Failed to access webhook_events table",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  // 7. Check user's Stripe customer status
  try {
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id, stripe_subscription_id, plan")
      .eq("id", user.id)
      .single();

    results.current_user = {
      status: "ok",
      message: "Current user data retrieved",
      details: {
        has_stripe_customer_id: !!userData?.stripe_customer_id,
        has_subscription: !!userData?.stripe_subscription_id,
        current_plan: userData?.plan || "free",
      },
    };

    // Verify customer exists in Stripe if ID is set
    if (userData?.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(userData.stripe_customer_id);
        results.stripe_customer = {
          status: customer.deleted ? "warning" : "ok",
          message: customer.deleted
            ? "Customer exists but is deleted in Stripe"
            : "Customer verified in Stripe",
          details: {
            id: customer.id,
            deleted: customer.deleted,
          },
        };

        // Check for subscriptions associated with this customer (even if not saved in DB)
        const customerSubscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: "active",
          limit: 5,
        });

        if (customerSubscriptions.data.length > 0 && !userData.stripe_subscription_id) {
          const activeSub = customerSubscriptions.data[0];
          const priceAmount = activeSub.items.data[0]?.price.unit_amount;
          let detectedPlan: "starter" | "pro" | "unknown" = "unknown";
          if (priceAmount === 1900) detectedPlan = "starter";
          else if (priceAmount === 4900) detectedPlan = "pro";

          results.missing_subscription = {
            status: "error",
            message: `FOUND ACTIVE SUBSCRIPTION NOT LINKED: ${activeSub.id} (${detectedPlan} plan)`,
            details: {
              subscription_id: activeSub.id,
              status: activeSub.status,
              price_amount: priceAmount,
              detected_plan: detectedPlan,
              fix_instruction: "POST to this endpoint to link subscription and update plan",
            },
          };
        }
      } catch (error) {
        results.stripe_customer = {
          status: "error",
          message: "Failed to verify customer in Stripe",
          details: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // Verify subscription if ID is set
    if (userData?.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(userData.stripe_subscription_id) as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const priceAmount = subscription.items.data[0]?.price.unit_amount;

        // Determine what plan the user SHOULD have based on subscription
        let expectedPlan: "starter" | "pro" | "unknown" = "unknown";
        if (priceAmount === 1900) expectedPlan = "starter";
        else if (priceAmount === 4900) expectedPlan = "pro";

        const planMismatch = subscription.status === "active" && expectedPlan !== "unknown" && expectedPlan !== userData.plan;

        // Get period end from subscription (handle different API versions)
        const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

        results.stripe_subscription = {
          status: planMismatch ? "error" : subscription.status === "active" ? "ok" : "warning",
          message: planMismatch
            ? `PLAN MISMATCH: User has "${userData.plan}" but should have "${expectedPlan}"`
            : `Subscription status: ${subscription.status}`,
          details: {
            id: subscription.id,
            status: subscription.status,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : "unknown",
            price_id: priceId,
            price_amount_cents: priceAmount,
            expected_plan: expectedPlan,
            current_plan_in_db: userData.plan,
            plan_mismatch: planMismatch,
          },
        };

        // If there's a mismatch and subscription is active, offer fix
        if (planMismatch) {
          results.fix_available = {
            status: "warning",
            message: `Run POST /api/diagnostic/stripe to fix plan to "${expectedPlan}"`,
            details: { action: "POST to this endpoint will update plan" },
          };
        }
      } catch (error) {
        results.stripe_subscription = {
          status: "error",
          message: "Failed to verify subscription in Stripe",
          details: error instanceof Error ? error.message : String(error),
        };
      }
    }
  } catch (error) {
    results.current_user = {
      status: "error",
      message: "Failed to retrieve current user data",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  // Calculate overall status
  const statuses = Object.values(results).map(r => r.status);
  const overallStatus = statuses.includes("error")
    ? "error"
    : statuses.includes("warning")
      ? "warning"
      : "ok";

  return NextResponse.json({
    overall_status: overallStatus,
    timestamp: new Date().toISOString(),
    user_id: user.id,
    checks: results,
  });
}

/**
 * POST handler to fix plan mismatch
 * Will update user's plan based on their active Stripe subscription
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized - must be authenticated" },
      { status: 401 }
    );
  }

  try {
    // Get user data
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id, stripe_subscription_id, plan")
      .eq("id", user.id)
      .single();

    const stripe = getStripeClient();
    let subscription: Stripe.Subscription | null = null;

    // If we have a subscription ID, use it
    if (userData?.stripe_subscription_id) {
      subscription = await stripe.subscriptions.retrieve(userData.stripe_subscription_id) as Stripe.Subscription;
    }
    // Otherwise, try to find an active subscription by customer ID
    else if (userData?.stripe_customer_id) {
      const customerSubscriptions = await stripe.subscriptions.list({
        customer: userData.stripe_customer_id,
        status: "active",
        limit: 1,
      });
      if (customerSubscriptions.data.length > 0) {
        subscription = customerSubscriptions.data[0];
      }
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found in Stripe", current_plan: userData?.plan },
        { status: 400 }
      );
    }

    if (subscription.status !== "active") {
      return NextResponse.json(
        { error: "Subscription is not active", status: subscription.status },
        { status: 400 }
      );
    }

    // Determine correct plan from price amount
    const priceAmount = subscription.items.data[0]?.price.unit_amount;
    let correctPlan: "starter" | "pro" | null = null;

    if (priceAmount === 1900) correctPlan = "starter";
    else if (priceAmount === 4900) correctPlan = "pro";

    if (!correctPlan) {
      return NextResponse.json(
        { error: "Could not determine plan from price", price_amount: priceAmount },
        { status: 400 }
      );
    }

    // Update user's plan and subscription ID
    const { error: updateError } = await supabase
      .from("users")
      .update({
        plan: correctPlan,
        stripe_subscription_id: subscription.id,
        conversions_used_this_month: 0,
        billing_cycle_start: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update plan", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Plan updated from "${userData?.plan}" to "${correctPlan}"`,
      previous_plan: userData?.plan,
      new_plan: correctPlan,
      subscription_id_linked: subscription.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fix plan", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
