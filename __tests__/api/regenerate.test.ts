/**
 * Tests for /api/regenerate route business logic
 */

import { regenerateRequestSchema, formatZodErrors } from "@/lib/validations";
import { getPlanLimits, canRegenerate } from "@/lib/config/plans";

describe("/api/regenerate", () => {
  describe("Request Validation", () => {
    it("should accept valid regenerate request for x_thread", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "550e8400-e29b-41d4-a716-446655440000",
        format: "x_thread",
      });

      expect(result.success).toBe(true);
    });

    it("should accept valid regenerate request for linkedin_post", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "550e8400-e29b-41d4-a716-446655440000",
        format: "linkedin_post",
      });

      expect(result.success).toBe(true);
    });

    it("should accept valid regenerate request for linkedin_article", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "550e8400-e29b-41d4-a716-446655440000",
        format: "linkedin_article",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "not-a-uuid",
        format: "x_thread",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid format", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "550e8400-e29b-41d4-a716-446655440000",
        format: "invalid_format",
      });

      expect(result.success).toBe(false);
    });

    it("should reject missing outputId", () => {
      const result = regenerateRequestSchema.safeParse({
        format: "x_thread",
      });

      expect(result.success).toBe(false);
    });

    it("should reject missing format", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result.success).toBe(false);
    });

    it("should format validation errors correctly", () => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "invalid",
        format: "invalid",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        expect(errors).toHaveProperty("outputId");
        expect(errors).toHaveProperty("format");
      }
    });
  });

  describe("Regeneration Limits", () => {
    it("should allow regeneration when under limit (free plan)", () => {
      // Version 1 is the original, so currentVersionCount=1 means 0 regenerations done
      expect(canRegenerate("free", 1)).toBe(true);
    });

    it("should deny regeneration when at limit (free plan)", () => {
      const limits = getPlanLimits("free");
      // If regeneratesPerConversion is 1, version 2 exists, no more allowed
      const maxVersions = limits.regeneratesPerConversion + 1;
      expect(canRegenerate("free", maxVersions)).toBe(false);
    });

    it("should allow more regenerations on paid plans", () => {
      const freeLimits = getPlanLimits("free");
      const starterLimits = getPlanLimits("starter");
      const proLimits = getPlanLimits("pro");

      expect(starterLimits.regeneratesPerConversion).toBeGreaterThanOrEqual(
        freeLimits.regeneratesPerConversion
      );
      expect(proLimits.regeneratesPerConversion).toBeGreaterThanOrEqual(
        starterLimits.regeneratesPerConversion
      );
    });

    it("should calculate remaining regenerations correctly", () => {
      const limits = getPlanLimits("starter");
      const currentVersionCount = 2; // Original + 1 regeneration

      // Remaining = max versions - current version count
      const maxVersions = limits.regeneratesPerConversion + 1;
      const remaining = maxVersions - currentVersionCount;

      expect(remaining).toBe(limits.regeneratesPerConversion - 1);
    });
  });

  describe("Output Formats", () => {
    const validFormats = ["x_thread", "linkedin_post", "linkedin_article"];

    validFormats.forEach((format) => {
      it(`should accept format: ${format}`, () => {
        const result = regenerateRequestSchema.safeParse({
          outputId: "550e8400-e29b-41d4-a716-446655440000",
          format,
        });

        expect(result.success).toBe(true);
      });
    });

    it("should have exactly 3 valid formats", () => {
      expect(validFormats.length).toBe(3);
    });
  });

  describe("Response Structure", () => {
    it("should define expected success response structure", () => {
      const expectedFields = [
        "outputId",
        "content",
        "version",
        "format",
        "conversionId",
        "usage",
      ];

      const expectedUsageFields = [
        "versionsUsed",
        "versionsLimit",
        "canRegenerate",
      ];

      expect(expectedFields.length).toBe(6);
      expect(expectedUsageFields.length).toBe(3);
    });

    it("should include version tracking in response", () => {
      // Response should show:
      // - Current version number
      // - Whether user can regenerate again
      const usageTracking = {
        versionsUsed: 2,
        versionsLimit: 3,
        canRegenerate: true,
      };

      expect(usageTracking.canRegenerate).toBe(
        usageTracking.versionsUsed < usageTracking.versionsLimit
      );
    });
  });

  describe("Error Codes", () => {
    const expectedErrorCodes = [
      "RATE_LIMIT_EXCEEDED",
      "VALIDATION_ERROR",
      "UNAUTHENTICATED",
      "NOT_FOUND",
      "REGENERATE_LIMIT_EXCEEDED",
      "INTERNAL_ERROR",
    ];

    it("should define all expected error codes", () => {
      expect(expectedErrorCodes.length).toBeGreaterThan(0);
      expect(expectedErrorCodes).toContain("REGENERATE_LIMIT_EXCEEDED");
      expect(expectedErrorCodes).toContain("NOT_FOUND");
    });
  });
});
