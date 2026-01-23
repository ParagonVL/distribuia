import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Invalid cron authorization");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Find users whose billing cycle has completed (billing_cycle_start + 1 month <= now)
    // Reset their usage and update billing_cycle_start
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: usersToReset, error: selectError } = await supabase
      .from("users")
      .select("id, billing_cycle_start")
      .lte("billing_cycle_start", oneMonthAgo.toISOString());

    if (selectError) {
      console.error("Error finding users to reset:", selectError);
      return NextResponse.json(
        { error: "Database error", details: selectError.message },
        { status: 500 }
      );
    }

    if (!usersToReset || usersToReset.length === 0) {
      console.log("No users to reset");
      return NextResponse.json({ reset: 0 });
    }

    // Reset usage for each user
    const userIds = usersToReset.map((u) => u.id);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        conversions_used_this_month: 0,
        billing_cycle_start: now,
      })
      .in("id", userIds);

    if (updateError) {
      console.error("Error resetting user usage:", updateError);
      return NextResponse.json(
        { error: "Update error", details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`Reset usage for ${usersToReset.length} users`);

    return NextResponse.json({
      reset: usersToReset.length,
      timestamp: now,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
