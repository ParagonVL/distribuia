import Stripe from "stripe";

// Server-side Stripe client
// Only use this in server components, API routes, or server actions
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY environment variable is not set. Please add it to your .env.local file."
      );
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeClient;
}

// Stripe price IDs - configure these in your Stripe dashboard
// Then add the IDs to your environment variables
// Using NEXT_PUBLIC prefix so they can be used client-side (price IDs are not secrets)
export const STRIPE_PRICES = {
  starter_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || "",
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "",
} as const;

// Map price IDs to plan types
// Checks both environment variables and hardcoded fallbacks to handle Vercel env issues
export function getPlanFromPriceId(priceId: string): "starter" | "pro" | null {
  // First try the environment variables
  if (priceId === STRIPE_PRICES.starter_monthly && STRIPE_PRICES.starter_monthly) return "starter";
  if (priceId === STRIPE_PRICES.pro_monthly && STRIPE_PRICES.pro_monthly) return "pro";

  // Fallback: Check known price ID patterns if env vars are empty
  // These are loaded at build time, so if they're in Vercel but added after build, they might be empty
  const starterEnv = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY;
  const proEnv = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

  if (priceId === starterEnv) return "starter";
  if (priceId === proEnv) return "pro";

  // Log for debugging when no match is found
  console.log("[getPlanFromPriceId] No match found", {
    incomingPriceId: priceId,
    starterFromConst: STRIPE_PRICES.starter_monthly || "(empty)",
    proFromConst: STRIPE_PRICES.pro_monthly || "(empty)",
    starterFromEnv: starterEnv || "(empty)",
    proFromEnv: proEnv || "(empty)",
  });

  return null;
}

// Map plan types to price IDs
export function getPriceIdFromPlan(plan: "starter" | "pro"): string {
  if (plan === "starter") return STRIPE_PRICES.starter_monthly;
  if (plan === "pro") return STRIPE_PRICES.pro_monthly;
  throw new Error(`Invalid plan: ${plan}`);
}
