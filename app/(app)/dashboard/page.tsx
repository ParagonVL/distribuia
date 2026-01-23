import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/config/plans";
import { ConversionForm } from "./conversion-form";
import type { User } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canConvert = true;
  let remaining = 2;

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("plan, conversions_used_this_month")
      .eq("id", user.id)
      .single<Pick<User, "plan" | "conversions_used_this_month">>();

    if (userData) {
      const limits = getPlanLimits(userData.plan);
      remaining = limits.conversionsPerMonth - userData.conversions_used_this_month;
      canConvert = remaining > 0;
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-8">
        Nueva conversion
      </h1>
      <ConversionForm
        canConvert={canConvert}
        remaining={remaining}
      />
    </div>
  );
}
