import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/config/plans";
import { BillingClient } from "./billing-client";
import type { PlanType } from "@/lib/config/plans";
import { getStripeClient } from "@/lib/stripe";

// Disable caching for this page - always fetch fresh user data
export const dynamic = "force-dynamic";

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    userData = data;
  }

  const plan = (userData?.plan || "free") as PlanType;
  const planLimits = getPlanLimits(plan);
  const conversionsUsed = userData?.conversions_used_this_month || 0;

  // Check Stripe directly for active subscriptions (source of truth)
  // This handles cases where database is out of sync with Stripe
  let hasStripeSubscription = false;
  let activeSubscriptionId: string | null = userData?.stripe_subscription_id || null;
  let cancelAt: string | null = null;

  if (userData?.stripe_customer_id) {
    try {
      const stripe = getStripeClient();

      // Query Stripe for active/trialing subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: userData.stripe_customer_id,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        hasStripeSubscription = true;
        const subscription = subscriptions.data[0];
        activeSubscriptionId = subscription.id;

        // Check if scheduled for cancellation
        const cancelAtTimestamp = (subscription as unknown as { cancel_at?: number }).cancel_at;
        if (cancelAtTimestamp) {
          cancelAt = new Date(cancelAtTimestamp * 1000).toISOString();
        }

        // Auto-sync subscription ID to database if missing
        if (!userData.stripe_subscription_id && user) {
          await supabase
            .from("users")
            .update({ stripe_subscription_id: activeSubscriptionId })
            .eq("id", user.id);
        }
      } else {
        // Also check for trialing subscriptions
        const trialingSubscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: "trialing",
          limit: 1,
        });

        if (trialingSubscriptions.data.length > 0) {
          hasStripeSubscription = true;
          const subscription = trialingSubscriptions.data[0];
          activeSubscriptionId = subscription.id;

          const cancelAtTimestamp = (subscription as unknown as { cancel_at?: number }).cancel_at;
          if (cancelAtTimestamp) {
            cancelAt = new Date(cancelAtTimestamp * 1000).toISOString();
          }

          if (!userData.stripe_subscription_id && user) {
            await supabase
              .from("users")
              .update({ stripe_subscription_id: activeSubscriptionId })
              .eq("id", user.id);
          }
        }
      }
    } catch {
      // Fallback to database value if Stripe API fails
      hasStripeSubscription = !!userData?.stripe_subscription_id;
    }
  } else {
    // No customer ID - fall back to database check
    hasStripeSubscription = !!userData?.stripe_subscription_id;
  }

  return (
    <BillingClient
      currentPlan={plan}
      planName={planLimits.name}
      planDescription={planLimits.description}
      conversionsUsed={conversionsUsed}
      conversionsLimit={planLimits.conversionsPerMonth}
      hasStripeSubscription={hasStripeSubscription}
      showSuccess={params.success === "true"}
      showCanceled={params.canceled === "true"}
      cancelAt={cancelAt}
    />
  );
}
