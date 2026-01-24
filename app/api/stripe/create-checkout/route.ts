import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, STRIPE_PRICES } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/stripe/portal";
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

    // Parse request body
    const body = await request.json();
    const { priceId } = body;

    // Validate price ID
    const validPriceIds = [STRIPE_PRICES.starter_monthly, STRIPE_PRICES.pro_monthly];
    if (!priceId || !validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: { code: "INVALID_PRICE", message: "Plan no válido" } },
        { status: 400 }
      );
    }

    // Get user data to check for existing Stripe customer
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      user.email || "",
      user.id,
      userData?.stripe_customer_id
    );

    // Update user with Stripe customer ID if new
    if (!userData?.stripe_customer_id) {
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const stripe = getStripeClient();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      metadata: {
        supabase_user_id: user.id,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      locale: "es",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error("Checkout session error", error);
    return NextResponse.json(
      {
        error: {
          code: "CHECKOUT_ERROR",
          message: "Error al crear la sesión de pago. Inténtalo de nuevo.",
        },
      },
      { status: 500 }
    );
  }
}
