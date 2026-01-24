import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/config/plans";
import { BillingClient } from "./billing-client";
import type { PlanType } from "@/lib/config/plans";

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
  const hasStripeSubscription = !!userData?.stripe_subscription_id;

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
    />
  );
}
