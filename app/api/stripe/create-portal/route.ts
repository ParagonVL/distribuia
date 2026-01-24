import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe/portal";
import { validateCSRF } from "@/lib/csrf";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Debes iniciar sesión" } },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: {
            code: "NO_SUBSCRIPTION",
            message: "No tienes una suscripción activa",
          },
        },
        { status: 400 }
      );
    }

    // Create portal session
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
    const returnUrl = `${origin}/billing`;

    const portalUrl = await createPortalSession(
      userData.stripe_customer_id,
      returnUrl
    );

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    logger.error("Portal session error", error);
    return NextResponse.json(
      {
        error: {
          code: "PORTAL_ERROR",
          message: "Error al acceder al portal. Inténtalo de nuevo.",
        },
      },
      { status: 500 }
    );
  }
}
