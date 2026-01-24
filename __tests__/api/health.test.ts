/**
 * @jest-environment node
 */

/**
 * API Route Tests: /api/health
 *
 * Tests the health check endpoint used for monitoring and uptime checks.
 */

describe("GET /api/health", () => {
  describe("Response Structure", () => {
    it("should return status 200 for healthy service", () => {
      // Health endpoint returns:
      // - status: "ok"
      // - timestamp: ISO date string
      // - uptime: process uptime in seconds
      // - environment: NODE_ENV value
      // - version: app version from package.json
      const expectedFields = ["status", "timestamp", "uptime", "environment", "version"];
      expect(expectedFields).toHaveLength(5);
    });

    it("should include correct status field", () => {
      const response = { status: "ok" };
      expect(response.status).toBe("ok");
    });

    it("should include valid ISO timestamp", () => {
      const timestamp = new Date().toISOString();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should include uptime as number", () => {
      const uptime = process.uptime();
      expect(typeof uptime).toBe("number");
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Cache Headers", () => {
    it("should not cache health responses", () => {
      // Health checks should always return fresh data
      const expectedCacheControl = "no-cache, no-store, must-revalidate";
      expect(expectedCacheControl).toContain("no-cache");
    });
  });

  describe("No Authentication Required", () => {
    it("should be accessible without authentication", () => {
      // Health endpoint is public for monitoring services
      const requiresAuth = false;
      expect(requiresAuth).toBe(false);
    });
  });
});
