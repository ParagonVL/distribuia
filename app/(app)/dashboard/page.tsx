import { createClient } from "@/lib/supabase/server";
import { getPlanLimits, shouldAddWatermark } from "@/lib/config/plans";
import { ConversionForm } from "./conversion-form";
import type { User } from "@/types/database";

// Disable caching - always fetch fresh user data
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canConvert = true;
  let remaining = 2;
  let hasWatermark = true;
  let plan: "free" | "starter" | "pro" = "free";

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("plan, conversions_used_this_month")
      .eq("id", user.id)
      .single<Pick<User, "plan" | "conversions_used_this_month">>();

    if (userData) {
      plan = userData.plan;
      const limits = getPlanLimits(userData.plan);
      remaining = limits.conversionsPerMonth - userData.conversions_used_this_month;
      canConvert = remaining > 0;
      hasWatermark = shouldAddWatermark(userData.plan);
    }
  }

  return (
    <div>
      <ConversionForm
        canConvert={canConvert}
        remaining={remaining}
        hasWatermark={hasWatermark}
        plan={plan}
      />
    </div>
  );
}
