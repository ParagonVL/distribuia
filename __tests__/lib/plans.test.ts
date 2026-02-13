import {
  PLAN_LIMITS,
  getPlanLimits,
  canCreateConversion,
  canRegenerate,
  getRemainingConversions,
  shouldAddWatermark,
  addWatermarkIfNeeded,
  WATERMARK,
} from "@/lib/config/plans";

describe("PLAN_LIMITS", () => {
  it("should have correct limits for free plan", () => {
    expect(PLAN_LIMITS.free.conversionsPerMonth).toBe(2);
    expect(PLAN_LIMITS.free.regeneratesPerConversion).toBe(1);
  });

  it("should have correct limits for starter plan", () => {
    expect(PLAN_LIMITS.starter.conversionsPerMonth).toBe(10);
    expect(PLAN_LIMITS.starter.regeneratesPerConversion).toBe(3);
  });

  it("should have correct limits for pro plan", () => {
    expect(PLAN_LIMITS.pro.conversionsPerMonth).toBe(30);
    expect(PLAN_LIMITS.pro.regeneratesPerConversion).toBe(3);
  });
});

describe("getPlanLimits", () => {
  it("should return correct limits for each plan", () => {
    expect(getPlanLimits("free")).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits("starter")).toEqual(PLAN_LIMITS.starter);
    expect(getPlanLimits("pro")).toEqual(PLAN_LIMITS.pro);
  });

  it("should return undefined for invalid input", () => {
    // @ts-expect-error - Testing invalid input
    expect(getPlanLimits("invalid")).toBeUndefined();
  });
});

describe("canCreateConversion", () => {
  it("should allow conversion when under limit", () => {
    expect(canCreateConversion("free", 0)).toBe(true);
    expect(canCreateConversion("free", 1)).toBe(true);
    expect(canCreateConversion("starter", 5)).toBe(true);
    expect(canCreateConversion("pro", 25)).toBe(true);
  });

  it("should deny conversion when at or over limit", () => {
    expect(canCreateConversion("free", 2)).toBe(false);
    expect(canCreateConversion("free", 3)).toBe(false);
    expect(canCreateConversion("starter", 10)).toBe(false);
    expect(canCreateConversion("pro", 30)).toBe(false);
  });
});

describe("canRegenerate", () => {
  it("should allow regeneration when under limit", () => {
    // Version 1 is the original, so we can regenerate up to limit times
    expect(canRegenerate("free", 1)).toBe(true); // Can create version 2
    expect(canRegenerate("starter", 1)).toBe(true);
    expect(canRegenerate("starter", 2)).toBe(true);
    expect(canRegenerate("starter", 3)).toBe(true);
  });

  it("should deny regeneration when at limit", () => {
    // Free plan: 1 regenerate means max version is 2
    expect(canRegenerate("free", 2)).toBe(false);
    // Starter/Pro: 3 regenerates means max version is 4
    expect(canRegenerate("starter", 4)).toBe(false);
    expect(canRegenerate("pro", 4)).toBe(false);
  });
});

describe("getRemainingConversions", () => {
  it("should return full allowance when no conversions used", () => {
    expect(getRemainingConversions("free", 0)).toBe(2);
    expect(getRemainingConversions("starter", 0)).toBe(10);
    expect(getRemainingConversions("pro", 0)).toBe(30);
  });

  it("should return correct remaining count", () => {
    expect(getRemainingConversions("free", 1)).toBe(1);
    expect(getRemainingConversions("starter", 5)).toBe(5);
    expect(getRemainingConversions("pro", 25)).toBe(5);
  });

  it("should return 0 when at or over limit", () => {
    expect(getRemainingConversions("free", 2)).toBe(0);
    expect(getRemainingConversions("free", 5)).toBe(0);
    expect(getRemainingConversions("starter", 10)).toBe(0);
    expect(getRemainingConversions("starter", 15)).toBe(0);
    expect(getRemainingConversions("pro", 30)).toBe(0);
  });
});

describe("shouldAddWatermark", () => {
  it("should return true for free plan", () => {
    expect(shouldAddWatermark("free")).toBe(true);
  });

  it("should return false for paid plans", () => {
    expect(shouldAddWatermark("starter")).toBe(false);
    expect(shouldAddWatermark("pro")).toBe(false);
  });
});

describe("WATERMARK", () => {
  it("should have watermark for x_thread format", () => {
    expect(WATERMARK.x_thread).toContain("Distribuia.es");
  });

  it("should have watermark for linkedin_post format", () => {
    expect(WATERMARK.linkedin_post).toContain("Distribuia.es");
  });

  it("should have watermark for linkedin_article format", () => {
    expect(WATERMARK.linkedin_article).toContain("Distribuia.es");
  });
});

describe("addWatermarkIfNeeded", () => {
  const testContent = "Test content here";

  it("should add watermark for free plan", () => {
    const result = addWatermarkIfNeeded(testContent, "x_thread", "free");
    expect(result).toContain(testContent);
    expect(result).toContain("Distribuia.es");
  });

  it("should not add watermark for starter plan", () => {
    const result = addWatermarkIfNeeded(testContent, "x_thread", "starter");
    expect(result).toBe(testContent);
    expect(result).not.toContain("Distribuia.es");
  });

  it("should not add watermark for pro plan", () => {
    const result = addWatermarkIfNeeded(testContent, "linkedin_post", "pro");
    expect(result).toBe(testContent);
    expect(result).not.toContain("Distribuia.es");
  });

  it("should add correct watermark for each format", () => {
    const xResult = addWatermarkIfNeeded(testContent, "x_thread", "free");
    const postResult = addWatermarkIfNeeded(testContent, "linkedin_post", "free");
    const articleResult = addWatermarkIfNeeded(testContent, "linkedin_article", "free");

    expect(xResult).toContain(WATERMARK.x_thread);
    expect(postResult).toContain(WATERMARK.linkedin_post);
    expect(articleResult).toContain(WATERMARK.linkedin_article);
  });
});
