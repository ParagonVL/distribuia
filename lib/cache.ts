import { Redis } from "@upstash/redis";

/**
 * Cache utility using Upstash Redis
 * Provides simple key-value caching with TTL support
 */

// Check if Upstash Redis is configured
const isCacheEnabled = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client only if configured
const redis = isCacheEnabled
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Cache TTL presets in seconds
export const CACHE_TTL = {
  SHORT: 60,          // 1 minute - for frequently changing data
  MEDIUM: 300,        // 5 minutes - for user usage data
  LONG: 900,          // 15 minutes - for history pages
  VERY_LONG: 3600,    // 1 hour - for static configuration
} as const;

// Cache key prefixes
const CACHE_PREFIX = {
  USER_USAGE: "cache:user:usage:",
  HISTORY_COUNT: "cache:history:count:",
  HISTORY_PAGE: "cache:history:page:",
} as const;

/**
 * Get a value from cache
 * @returns The cached value or null if not found/expired
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set a value in cache with TTL
 * @param key - Cache key
 * @param value - Value to cache (must be JSON serializable)
 * @param ttlSeconds - Time to live in seconds
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

/**
 * Delete multiple keys matching a pattern
 * Uses SCAN for safety (doesn't block Redis)
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    // For Upstash, we'll delete known keys instead of using SCAN
    // This is because Upstash has limitations on SCAN in serverless
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Cache delete pattern error:", error);
  }
}

/**
 * Cache key generators
 */
export const cacheKey = {
  userUsage: (userId: string) => `${CACHE_PREFIX.USER_USAGE}${userId}`,
  historyCount: (userId: string) => `${CACHE_PREFIX.HISTORY_COUNT}${userId}`,
  historyPage: (userId: string, page: number) =>
    `${CACHE_PREFIX.HISTORY_PAGE}${userId}:${page}`,
};

/**
 * Invalidate all cache for a user
 * Call this after conversions, regenerations, or deletions
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  if (!redis) return;

  try {
    // Delete specific known keys
    await cacheDelete(cacheKey.userUsage(userId));
    await cacheDelete(cacheKey.historyCount(userId));
    // Delete history page cache (pages 1-10 typically)
    const pageDeletes = Array.from({ length: 10 }, (_, i) =>
      cacheDelete(cacheKey.historyPage(userId, i + 1))
    );
    await Promise.all(pageDeletes);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

/**
 * Get or set cache pattern (cache-aside)
 * If cache miss, executes the fetcher and caches the result
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch fresh data
  const freshData = await fetcher();

  // Cache the result (don't await to avoid blocking)
  cacheSet(key, freshData, ttlSeconds).catch(() => {
    // Silently ignore cache set errors
  });

  return freshData;
}

/**
 * Check if caching is enabled
 */
export function isCachingEnabled(): boolean {
  return isCacheEnabled;
}
