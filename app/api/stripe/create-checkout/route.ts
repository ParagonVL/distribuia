import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { getStripeClient, STRIPE_PRICES } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/stripe/portal";
import { validateCSRF } from "@/lib/csrf";
import logger from "@/lib/logger";

// Admin client for storing waiver (bypasses RLS)
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
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  try {
    // Get authenticated user
    const supabase = await createServerClient();
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
    const { priceId, waiverAccepted } = body;

    // Waiver is required for new subscriptions
    if (!waiverAccepted) {
      return NextResponse.json(
        { error: { code: "WAIVER_REQUIRED", message: "Debes aceptar la renuncia al derecho de desistimiento" } },
        { status: 400 }
      );
    }

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

    // Determine product name from price ID
    const productName = priceId === STRIPE_PRICES.starter_monthly ? "starter" : "pro";

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
      billing_address_collection: "auto",
      locale: "es",
    });

    // Store waiver acceptance for legal compliance
    const supabaseAdmin = getSupabaseAdmin();
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await (supabaseAdmin as ReturnType<typeof createClient>).from("withdrawal_waivers").insert({
      user_id: user.id,
      product: productName,
      ip_address: ipAddress,
      user_agent: userAgent,
      waiver_version: "v1",
      checkout_session_id: session.id,
    });

    logger.info("Waiver acceptance stored", { userId: user.id, product: productName, sessionId: session.id });

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
