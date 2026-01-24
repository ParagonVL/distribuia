import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Use configured app URL for consistency
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  const supabase = await createClient();
  let errorCode = "unknown";

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // For password recovery, redirect to update password page
      if (next.includes("settings") || type === "recovery") {
        return NextResponse.redirect(`${origin}/settings?tab=security`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    logger.error("Code exchange error", { error: error.message, code: error.code });
    errorCode = error.code || "code_exchange_failed";
  }

  // Handle token hash flow (email links like password reset)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "signup" | "email",
    });

    if (!error) {
      // For password recovery, redirect to a page where user can update password
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/update-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    logger.error("OTP verification error", {
      error: error.message,
      code: error.code,
      type
    });

    // Map Supabase error codes to user-friendly codes
    if (error.message?.includes("expired") || error.code === "otp_expired") {
      errorCode = "expired";
    } else if (error.message?.includes("already") || error.code === "otp_disabled") {
      errorCode = "already_used";
    } else {
      errorCode = error.code || "verification_failed";
    }
  }

  // Check if user is already authenticated AND email is confirmed
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Check if email is confirmed
    if (user.email_confirmed_at) {
      // User is authenticated and email confirmed - redirect to dashboard
      logger.info("User already confirmed, redirecting to dashboard", { userId: user.id });
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    // User exists but email not confirmed - show specific error
    errorCode = "not_confirmed";
  }

  // Return the user to an error page with error code for specific messaging
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${errorCode}`);
}
