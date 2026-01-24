export type PlanType = "free" | "starter" | "pro";

export interface PlanLimits {
  conversionsPerMonth: number;
  regeneratesPerConversion: number;
  name: string;
  description: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    conversionsPerMonth: 2,
    regeneratesPerConversion: 1,
    name: "Free",
    description: "Prueba Distribuia gratis",
  },
  starter: {
    conversionsPerMonth: 10,
    regeneratesPerConversion: 3,
    name: "Starter",
    description: "Para creadores que estan empezando",
  },
  pro: {
    conversionsPerMonth: 30,
    regeneratesPerConversion: 3,
    name: "Pro",
    description: "Para creadores profesionales",
  },
} as const;

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canCreateConversion(
  plan: PlanType,
  conversionsUsedThisMonth: number
): boolean {
  const limits = getPlanLimits(plan);
  return conversionsUsedThisMonth < limits.conversionsPerMonth;
}

export function canRegenerate(
  plan: PlanType,
  currentVersion: number
): boolean {
  const limits = getPlanLimits(plan);
  return currentVersion < limits.regeneratesPerConversion + 1;
}

export function getRemainingConversions(
  plan: PlanType,
  conversionsUsedThisMonth: number
): number {
  const limits = getPlanLimits(plan);
  return Math.max(0, limits.conversionsPerMonth - conversionsUsedThisMonth);
}

/**
 * Check if watermark should be added (free tier only)
 */
export function shouldAddWatermark(plan: PlanType): boolean {
  return plan === "free";
}

/**
 * Watermark text for different formats
 * For X threads: embedded in the last tweet (no --- separator to avoid appearing as separate tweet)
 */
export const WATERMARK = {
  // For X threads: embedded in the last tweet
  x_thread: "\n\n🔗 Creado con Distribuia.com",
  // For LinkedIn posts: appears at the end
  linkedin_post: "\n\n🔗 Creado con Distribuia.com",
  // For LinkedIn articles: appears at the end with link
  linkedin_article: "\n\n---\n\n*Creado con [Distribuia.com](https://distribuia.com)*",
} as const;

/**
 * Add watermark to content based on format and plan
 */
export function addWatermarkIfNeeded(
  content: string,
  format: "x_thread" | "linkedin_post" | "linkedin_article",
  plan: PlanType
): string {
  if (!shouldAddWatermark(plan)) {
    return content;
  }
  return content + WATERMARK[format];
}
