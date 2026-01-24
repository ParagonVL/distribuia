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

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists and get their status
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      logger.error("Error listing users", { error: listError.message });
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists or not - always return success
      logger.info("Resend confirmation requested for non-existent email", { email });
      return NextResponse.json({ success: true });
    }

    if (user.email_confirmed_at) {
      // Email already confirmed - still return success to not leak info
      logger.info("Resend confirmation requested for already confirmed email", { email });
      return NextResponse.json({ success: true });
    }

    // Use inviteUserByEmail to send a new confirmation-like email
    // This works for existing unconfirmed users
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    });

    if (inviteError) {
      // If invite fails (user already exists), try generating a magic link instead
      logger.warn("Invite failed, trying magic link", { error: inviteError.message });

      const { error: magicError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: user.email!,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (magicError) {
        logger.error("Error generating magic link", { error: magicError.message });
        // Still return success to not leak information
        return NextResponse.json({ success: true });
      }
    }

    logger.info("Confirmation/magic link email sent", { email });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error("Resend confirmation error", { error });
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
