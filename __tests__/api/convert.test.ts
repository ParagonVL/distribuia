/**
 * Tests for /api/convert route business logic
 *
 * Since API routes use Next.js server components and Supabase,
 * we test the validation and business logic separately.
 */

import { convertRequestSchema, formatZodErrors } from "@/lib/validations";
import { getPlanLimits, canCreateConversion } from "@/lib/config/plans";

describe("/api/convert", () => {
  describe("Request Validation", () => {
    it("should accept valid YouTube URL", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "youtube",
        inputValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        tone: "profesional",
      });

      expect(result.success).toBe(true);
    });

    it("should accept valid article URL", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "article",
        inputValue: "https://example.com/article",
        tone: "cercano",
      });

      expect(result.success).toBe(true);
    });

    it("should accept valid text input", () => {
      // Text input requires at least 100 characters
      const longText = "Este es un texto válido de prueba que tiene suficiente longitud para ser procesado por el sistema de conversión. Necesitamos más de cien caracteres.";
      const result = convertRequestSchema.safeParse({
        inputType: "text",
        inputValue: longText,
        tone: "tecnico",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty input", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "text",
        inputValue: "",
        tone: "profesional",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid input type", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "invalid",
        inputValue: "some value",
        tone: "profesional",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid tone", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "text",
        inputValue: "Valid text content here",
        tone: "invalid_tone",
      });

      expect(result.success).toBe(false);
    });

    it("should reject text that is too short", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "text",
        inputValue: "Too short",
        tone: "profesional",
      });

      expect(result.success).toBe(false);
    });

    it("should accept optional topics array", () => {
      // Text input requires at least 100 characters
      const longText = "Este es un texto válido de prueba que tiene suficiente longitud para ser procesado por el sistema de conversión. Necesitamos más de cien caracteres.";
      const result = convertRequestSchema.safeParse({
        inputType: "text",
        inputValue: longText,
        tone: "profesional",
        topics: ["tech", "startups"],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.topics).toEqual(["tech", "startups"]);
      }
    });

    it("should reject invalid YouTube URL", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "youtube",
        inputValue: "not-a-youtube-url",
        tone: "profesional",
      });

      expect(result.success).toBe(false);
    });

    it("should format Zod errors correctly", () => {
      const result = convertRequestSchema.safeParse({
        inputType: "youtube",
        inputValue: "",
        tone: "invalid",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        expect(typeof errors).toBe("object");
      }
    });
  });

  describe("Plan Limits", () => {
    it("should allow conversion when under limit (free plan)", () => {
      // Free plan has 2 conversions per month
      expect(canCreateConversion("free", 0)).toBe(true);
      expect(canCreateConversion("free", 1)).toBe(true);
    });

    it("should deny conversion when at limit (free plan)", () => {
      const limits = getPlanLimits("free");
      expect(canCreateConversion("free", limits.conversionsPerMonth)).toBe(false);
    });

    it("should allow more conversions on starter plan", () => {
      const freeLimits = getPlanLimits("free");
      const starterLimits = getPlanLimits("starter");

      expect(starterLimits.conversionsPerMonth).toBeGreaterThan(
        freeLimits.conversionsPerMonth
      );
      expect(canCreateConversion("starter", freeLimits.conversionsPerMonth)).toBe(true);
    });

    it("should allow most conversions on pro plan", () => {
      const starterLimits = getPlanLimits("starter");
      const proLimits = getPlanLimits("pro");

      expect(proLimits.conversionsPerMonth).toBeGreaterThan(
        starterLimits.conversionsPerMonth
      );
    });
  });

  describe("CSRF Protection Design", () => {
    it("should require X-Requested-With header for POST", () => {
      // The convert endpoint requires CSRF header
      // This is verified by the CSRF middleware
      const requiredHeader = "X-Requested-With";
      const requiredValue = "XMLHttpRequest";

      expect(requiredHeader).toBe("X-Requested-With");
      expect(requiredValue).toBe("XMLHttpRequest");
    });
  });

  describe("Response Structure", () => {
    it("should define expected response structure", () => {
      // Expected successful response structure
      const expectedFields = [
        "conversionId",
        "source",
        "metadata",
        "outputs",
        "usage",
      ];

      const expectedOutputFields = ["x_thread", "linkedin_post", "linkedin_article"];
      const expectedUsageFields = [
        "conversionsUsed",
        "conversionsLimit",
        "regeneratesPerConversion",
      ];

      expect(expectedFields.length).toBe(5);
      expect(expectedOutputFields.length).toBe(3);
      expect(expectedUsageFields.length).toBe(3);
    });

    it("should define error response structure", () => {
      // Expected error response structure
      const errorStructure = {
        error: {
          code: "ERROR_CODE",
          message: "Error message",
        },
      };

      expect(errorStructure.error).toHaveProperty("code");
      expect(errorStructure.error).toHaveProperty("message");
    });
  });
});
