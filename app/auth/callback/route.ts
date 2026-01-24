import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

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
    console.error("Code exchange error:", error);
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
    console.error("OTP verification error:", error);
  }

  // Before showing error, check if user is already authenticated
  // This handles cases where the link was already used but user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // User is already authenticated, redirect to dashboard
    // The confirmation link might have been used already or session exists
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
