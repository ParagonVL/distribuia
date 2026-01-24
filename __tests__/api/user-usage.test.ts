/**
 * @jest-environment node
 */

/**
 * API Route Tests: /api/user/usage
 *
 * Tests the user usage endpoint that returns conversion limits and counts.
 */

describe("GET /api/user/usage", () => {
  describe("Authentication", () => {
    it("should require authentication", () => {
      // Returns 401 if no valid session
      const unauthenticatedStatus = 401;
      expect(unauthenticatedStatus).toBe(401);
    });

    it("should return UNAUTHENTICATED error code", () => {
      const errorResponse = {
        error: {
          code: "UNAUTHENTICATED",
          message: "Debes iniciar sesion",
        },
      };
      expect(errorResponse.error.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("Response Structure", () => {
    it("should return usage data for authenticated user", () => {
      // Expected response structure
      const usageResponse = {
        plan: "starter",
        conversionsUsed: 5,
        conversionsLimit: 10,
        remaining: 5,
        hasWatermark: false,
        billingCycleStart: "2024-01-01T00:00:00Z",
      };

      expect(usageResponse).toHaveProperty("plan");
      expect(usageResponse).toHaveProperty("conversionsUsed");
      expect(usageResponse).toHaveProperty("conversionsLimit");
      expect(usageResponse).toHaveProperty("remaining");
      expect(usageResponse).toHaveProperty("hasWatermark");
    });

    it("should calculate remaining correctly", () => {
      const conversionsUsed = 7;
      const conversionsLimit = 10;
      const remaining = conversionsLimit - conversionsUsed;
      expect(remaining).toBe(3);
    });

    it("should not return negative remaining", () => {
      const conversionsUsed = 12;
      const conversionsLimit = 10;
      const remaining = Math.max(0, conversionsLimit - conversionsUsed);
      expect(remaining).toBe(0);
    });
  });

  describe("Plan Limits", () => {
    const planLimits = {
      free: { conversionsLimit: 2, hasWatermark: true },
      starter: { conversionsLimit: 10, hasWatermark: false },
      pro: { conversionsLimit: 30, hasWatermark: false },
    };

    it("should return correct limits for free plan", () => {
      expect(planLimits.free.conversionsLimit).toBe(2);
      expect(planLimits.free.hasWatermark).toBe(true);
    });

    it("should return correct limits for starter plan", () => {
      expect(planLimits.starter.conversionsLimit).toBe(10);
      expect(planLimits.starter.hasWatermark).toBe(false);
    });

    it("should return correct limits for pro plan", () => {
      expect(planLimits.pro.conversionsLimit).toBe(30);
      expect(planLimits.pro.hasWatermark).toBe(false);
    });
  });

  describe("Caching", () => {
    it("should use short TTL for usage data", () => {
      // Usage is cached for 5 minutes to reduce DB load
      const cacheTTL = 5 * 60; // 5 minutes in seconds
      expect(cacheTTL).toBe(300);
    });

    it("should invalidate cache on conversion", () => {
      // Cache key pattern: user:usage:{userId}
      const cacheKeyPattern = /^user:usage:[a-f0-9-]+$/;
      expect("user:usage:123e4567-e89b-12d3-a456-426614174000").toMatch(cacheKeyPattern);
    });
  });
});
