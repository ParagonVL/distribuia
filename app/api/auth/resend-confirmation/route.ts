import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import logger from "@/lib/logger";

// Use admin client to resend confirmation
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      logger.error("Error listing users", { error: listError.message });
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists or not
      logger.info("Resend confirmation requested for non-existent email", { email });
      return NextResponse.json({ success: true });
    }

    if (user.email_confirmed_at) {
      // Email already confirmed
      logger.info("Resend confirmation requested for already confirmed email", { email });
      return NextResponse.json({ success: true });
    }

    // Generate new confirmation link
    const { error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: user.email!,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (linkError) {
      logger.error("Error generating confirmation link", { error: linkError.message });
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    logger.info("Confirmation email resent", { email });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error("Resend confirmation error", { error });
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
