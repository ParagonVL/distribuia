import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "@/lib/security";
import { sendMonthlyResetEmail, sendReengagementEmail, shouldSendEmail } from "@/lib/email/send";
import { getPlanLimits } from "@/lib/config/plans";
import type { PlanType } from "@/lib/config/plans";
import type { Database } from "@/types/database";
import logger from "@/lib/logger";

// Use service role key to bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for cron job");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron not configured" },
        { status: 500 }
      );
    }

    // Use constant-time comparison to prevent timing attacks
    const expectedHeader = `Bearer ${cronSecret}`;
    if (!timingSafeEqual(authHeader, expectedHeader)) {
      logger.error("Invalid cron authorization");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. MONTHLY RESET: Find users whose billing cycle has completed
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: usersToReset, error: selectError } = await supabase
      .from("users")
      .select("id, billing_cycle_start, plan, email_notifications_enabled")
      .lte("billing_cycle_start", oneMonthAgo.toISOString());

    if (selectError) {
      logger.error("Error finding users to reset", selectError);
      return NextResponse.json(
        { error: "Database error", details: selectError.message },
        { status: 500 }
      );
    }

    let resetCount = 0;
    const now = new Date().toISOString();

    if (usersToReset && usersToReset.length > 0) {
      const userIds = usersToReset.map((u) => u.id);

      const { error: updateError } = await supabase
        .from("users")
        .update({
          conversions_used_this_month: 0,
          billing_cycle_start: now,
          low_usage_email_sent_this_cycle: false,
        })
        .in("id", userIds);

      if (updateError) {
        logger.error("Error resetting user usage", updateError);
        return NextResponse.json(
          { error: "Update error", details: updateError.message },
          { status: 500 }
        );
      }

      resetCount = usersToReset.length;
      logger.info("Reset usage for users", { count: resetCount });

      // Send monthly reset emails (background, don't block response)
      for (const user of usersToReset) {
        if (user.email_notifications_enabled === false) continue;

        const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
        if (!authUser?.user?.email) continue;

        const planLimits = getPlanLimits(user.plan as PlanType);
        sendMonthlyResetEmail(
          authUser.user.email,
          planLimits.conversionsPerMonth,
          planLimits.name,
          user.id
        ).catch((err) => {
          logger.error("Failed to send monthly reset email", err);
        });
      }
    } else {
      logger.info("No users to reset");
    }

    // 2. RE-ENGAGEMENT: Find inactive users (no conversion in 14+ days, not already emailed)
    let reengagementCount = 0;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: inactiveUsers, error: inactiveError } = await supabase
      .from("users")
      .select("id, email_notifications_enabled")
      .lt("last_conversion_at", fourteenDaysAgo.toISOString())
      .eq("reengagement_email_sent", false);

    if (inactiveError) {
      logger.error("Error finding inactive users", inactiveError);
    } else if (inactiveUsers && inactiveUsers.length > 0) {
      for (const user of inactiveUsers) {
        if (user.email_notifications_enabled === false) continue;

        const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
        if (!authUser?.user?.email) continue;

        const result = await sendReengagementEmail(authUser.user.email, user.id);
        if (result.success) {
          await supabase
            .from("users")
            .update({ reengagement_email_sent: true })
            .eq("id", user.id);
          reengagementCount++;
        }
      }
      logger.info("Sent re-engagement emails", { count: reengagementCount });
    }

    return NextResponse.json({
      reset: resetCount,
      reengagement: reengagementCount,
      timestamp: now,
    });
  } catch (error) {
    logger.error("Cron job error", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
