// Mock the upstash modules to avoid ESM import issues
jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: jest.fn(() => ({
    limit: jest.fn().mockResolvedValue({ success: true, remaining: 5, reset: Date.now() + 60000 }),
  })),
}));

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn(),
}));

import { getRateLimitIdentifier, checkRateLimit } from "@/lib/ratelimit";

describe("getRateLimitIdentifier", () => {
  it("should return userId when provided", () => {
    expect(getRateLimitIdentifier("user-123", "192.168.1.1")).toBe("user-123");
  });

  it("should return IP when userId is null", () => {
    expect(getRateLimitIdentifier(null, "192.168.1.1")).toBe("192.168.1.1");
  });

  it("should return 'anonymous' when both are null", () => {
    expect(getRateLimitIdentifier(null, null)).toBe("anonymous");
  });

  it("should prefer userId over IP", () => {
    expect(getRateLimitIdentifier("user-abc", "10.0.0.1")).toBe("user-abc");
  });
});

describe("checkRateLimit", () => {
  it("should return null when limiter is null", async () => {
    const result = await checkRateLimit(null, "test-identifier");
    expect(result).toBeNull();
  });
});
