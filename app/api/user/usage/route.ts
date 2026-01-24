import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits, getRemainingConversions } from "@/lib/config/plans";
import { DistribuiaError, UnauthenticatedError } from "@/lib/errors";
import { cacheGetOrSet, cacheKey, CACHE_TTL } from "@/lib/cache";
import type { User } from "@/types/database";

interface UsageResponse {
  plan: { type: string; name: string; description: string };
  conversions: { used: number; limit: number; remaining: number };
  regenerates: { perConversion: number };
  billing: { cycleStart: string; nextReset: string; daysUntilReset: number };
  createdAt: string;
}

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthenticatedError();
    }

    // Use cache-aside pattern for usage data
    const usageData = await cacheGetOrSet<UsageResponse>(
      cacheKey.userUsage(user.id),
      async () => {
        // Get user data from database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single<User>();

        if (userError || !userData) {
          throw new UnauthenticatedError();
        }

        const planLimits = getPlanLimits(userData.plan);
        const remaining = getRemainingConversions(
          userData.plan,
          userData.conversions_used_this_month
        );

        // Calculate days until billing cycle reset
        const billingCycleStart = new Date(userData.billing_cycle_start);
        const nextReset = new Date(billingCycleStart);
        nextReset.setMonth(nextReset.getMonth() + 1);

        const now = new Date();
        const daysUntilReset = Math.ceil(
          (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          plan: {
            type: userData.plan,
            name: planLimits.name,
            description: planLimits.description,
          },
          conversions: {
            used: userData.conversions_used_this_month,
            limit: planLimits.conversionsPerMonth,
            remaining,
          },
          regenerates: {
            perConversion: planLimits.regeneratesPerConversion,
          },
          billing: {
            cycleStart: userData.billing_cycle_start,
            nextReset: nextReset.toISOString(),
            daysUntilReset: Math.max(0, daysUntilReset),
          },
          createdAt: userData.created_at,
        };
      },
      CACHE_TTL.MEDIUM // 5 minutes
    );

    return NextResponse.json(usageData);
  } catch (error) {
    console.error("Usage API error:", error);

    // Handle our custom errors
    if (error instanceof DistribuiaError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        },
      },
      { status: 500 }
    );
  }
}
