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
export function getPlanFromPriceId(priceId: string): "starter" | "pro" | null {
  if (priceId === STRIPE_PRICES.starter_monthly) return "starter";
  if (priceId === STRIPE_PRICES.pro_monthly) return "pro";
  return null;
}

// Map plan types to price IDs
export function getPriceIdFromPlan(plan: "starter" | "pro"): string {
  if (plan === "starter") return STRIPE_PRICES.starter_monthly;
  if (plan === "pro") return STRIPE_PRICES.pro_monthly;
  throw new Error(`Invalid plan: ${plan}`);
}
