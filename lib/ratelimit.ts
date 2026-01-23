import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis is configured
const isRateLimitEnabled =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client only if configured
const redis = isRateLimitEnabled
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Rate limiter for API routes
 * - 10 requests per 10 seconds for authenticated users
 * - 5 requests per 10 seconds for unauthenticated users
 */
export const apiRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

/**
 * Stricter rate limiter for expensive operations (conversions, regenerations)
 * - 5 requests per minute
 */
export const conversionRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:conversion",
    })
  : null;

/**
 * Rate limiter for authentication attempts
 * - 5 attempts per minute per IP
 */
export const authRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

/**
 * Check rate limit and return result
 * Returns null if rate limiting is not configured (allows request through)
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number } | null> {
  if (!limiter) {
    // Rate limiting not configured, allow request
    return null;
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Get identifier for rate limiting (user ID or IP)
 */
export function getRateLimitIdentifier(
  userId: string | null,
  ip: string | null
): string {
  return userId || ip || "anonymous";
}
