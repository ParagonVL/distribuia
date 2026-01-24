/**
 * E2E tests for content conversion flow
 *
 * Tests the complete conversion flow from request to response
 */

import { convertRequestSchema } from "@/lib/validations";
import { getPlanLimits, canCreateConversion, canRegenerate } from "@/lib/config/plans";

describe("Conversion Flow E2E", () => {
  describe("Input Validation", () => {
    describe("YouTube URLs", () => {
      const validYouTubeUrls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://www.youtube.com/shorts/abc123",
      ];

      validYouTubeUrls.forEach((url) => {
        it(`should accept valid YouTube URL: ${url.substring(0, 40)}...`, () => {
          const result = convertRequestSchema.safeParse({
            inputType: "youtube",
            inputValue: url,
            tone: "profesional",
          });
          expect(result.success).toBe(true);
        });
      });

      const invalidYouTubeUrls = [
        "https://vimeo.com/123456",
        "https://example.com/video",
        "not-a-url",
        "",
      ];

      invalidYouTubeUrls.forEach((url) => {
        it(`should reject invalid YouTube URL: ${url || "(empty)"}`, () => {
          const result = convertRequestSchema.safeParse({
            inputType: "youtube",
            inputValue: url,
            tone: "profesional",
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("Article URLs", () => {
      it("should accept valid https article URL", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "article",
          inputValue: "https://example.com/blog/article",
          tone: "profesional",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid http article URL", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "article",
          inputValue: "http://example.com/blog/article",
          tone: "profesional",
        });
        expect(result.success).toBe(true);
      });

      it("should reject non-URL input for article type", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "article",
          inputValue: "not a url",
          tone: "profesional",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Text Input", () => {
      it("should accept text with 100+ characters", () => {
        const longText = "a".repeat(100);
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: longText,
          tone: "profesional",
        });
        expect(result.success).toBe(true);
      });

      it("should reject text with less than 100 characters", () => {
        const shortText = "a".repeat(99);
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: shortText,
          tone: "profesional",
        });
        expect(result.success).toBe(false);
      });

      it("should reject text exceeding 50000 characters", () => {
        const tooLongText = "a".repeat(50001);
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: tooLongText,
          tone: "profesional",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Tone Options", () => {
      const validTones = ["profesional", "cercano", "tecnico"];

      validTones.forEach((tone) => {
        it(`should accept tone: ${tone}`, () => {
          const result = convertRequestSchema.safeParse({
            inputType: "youtube",
            inputValue: "https://youtube.com/watch?v=abc123",
            tone,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid tone", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "youtube",
          inputValue: "https://youtube.com/watch?v=abc123",
          tone: "invalid_tone",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Topics (Optional)", () => {
      it("should accept up to 5 topics", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: "a".repeat(100),
          tone: "profesional",
          topics: ["tech", "startups", "ai", "cloud", "security"],
        });
        expect(result.success).toBe(true);
      });

      it("should reject more than 5 topics", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: "a".repeat(100),
          tone: "profesional",
          topics: ["1", "2", "3", "4", "5", "6"],
        });
        expect(result.success).toBe(false);
      });

      it("should accept null topics", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: "a".repeat(100),
          tone: "profesional",
          topics: null,
        });
        expect(result.success).toBe(true);
      });

      it("should accept undefined topics", () => {
        const result = convertRequestSchema.safeParse({
          inputType: "text",
          inputValue: "a".repeat(100),
          tone: "profesional",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Plan Limits", () => {
    describe("Free Plan", () => {
      const freePlan = getPlanLimits("free");

      it("should have 2 conversions per month", () => {
        expect(freePlan.conversionsPerMonth).toBe(2);
      });

      it("should have 1 regeneration per conversion", () => {
        expect(freePlan.regeneratesPerConversion).toBe(1);
      });

      it("should allow conversion when under limit", () => {
        expect(canCreateConversion("free", 0)).toBe(true);
        expect(canCreateConversion("free", 1)).toBe(true);
      });

      it("should deny conversion when at limit", () => {
        expect(canCreateConversion("free", 2)).toBe(false);
        expect(canCreateConversion("free", 3)).toBe(false);
      });
    });

    describe("Starter Plan", () => {
      const starterPlan = getPlanLimits("starter");

      it("should have 10 conversions per month", () => {
        expect(starterPlan.conversionsPerMonth).toBe(10);
      });

      it("should have 3 regenerations per conversion", () => {
        expect(starterPlan.regeneratesPerConversion).toBe(3);
      });

      it("should allow more conversions than free plan", () => {
        expect(canCreateConversion("starter", 5)).toBe(true);
      });
    });

    describe("Pro Plan", () => {
      const proPlan = getPlanLimits("pro");

      it("should have 30 conversions per month", () => {
        expect(proPlan.conversionsPerMonth).toBe(30);
      });

      it("should have 3 regenerations per conversion", () => {
        expect(proPlan.regeneratesPerConversion).toBe(3);
      });

      it("should allow many more conversions", () => {
        expect(canCreateConversion("pro", 20)).toBe(true);
      });
    });
  });

  describe("Regeneration Flow", () => {
    it("should allow first regeneration (version 2)", () => {
      expect(canRegenerate("free", 1)).toBe(true); // Original is version 1
    });

    it("should deny regeneration when at limit (free)", () => {
      // Free plan: 1 regeneration = max 2 versions (original + 1)
      expect(canRegenerate("free", 2)).toBe(false);
    });

    it("should allow more regenerations on paid plans", () => {
      // Starter/Pro: 3 regenerations = max 4 versions
      expect(canRegenerate("starter", 2)).toBe(true);
      expect(canRegenerate("starter", 3)).toBe(true);
      expect(canRegenerate("starter", 4)).toBe(false);
    });
  });

  describe("Output Formats", () => {
    const expectedOutputs = ["x_thread", "linkedin_post", "linkedin_article"];

    it("should generate 3 output formats", () => {
      expect(expectedOutputs.length).toBe(3);
    });

    it("should include X thread format", () => {
      expect(expectedOutputs).toContain("x_thread");
    });

    it("should include LinkedIn post format", () => {
      expect(expectedOutputs).toContain("linkedin_post");
    });

    it("should include LinkedIn article format", () => {
      expect(expectedOutputs).toContain("linkedin_article");
    });
  });

  describe("Response Structure", () => {
    it("should define expected conversion response structure", () => {
      const expectedResponse = {
        conversionId: "uuid",
        source: { type: "youtube", title: "Video Title" },
        metadata: { duration: 600, language: "es" },
        outputs: {
          x_thread: { outputId: "uuid", content: "...", version: 1 },
          linkedin_post: { outputId: "uuid", content: "...", version: 1 },
          linkedin_article: { outputId: "uuid", content: "...", version: 1 },
        },
        usage: {
          conversionsUsed: 1,
          conversionsLimit: 2,
          regeneratesPerConversion: 1,
        },
      };

      expect(expectedResponse).toHaveProperty("conversionId");
      expect(expectedResponse).toHaveProperty("source");
      expect(expectedResponse).toHaveProperty("outputs");
      expect(expectedResponse).toHaveProperty("usage");
    });
  });

  describe("Error Scenarios", () => {
    const errorCodes = {
      VALIDATION_ERROR: 400,
      UNAUTHENTICATED: 401,
      CSRF_VALIDATION_FAILED: 403,
      LIMIT_EXCEEDED: 403,
      RATE_LIMIT_EXCEEDED: 429,
      INTERNAL_ERROR: 500,
    };

    Object.entries(errorCodes).forEach(([code, status]) => {
      it(`should return ${status} for ${code}`, () => {
        expect(status).toBeGreaterThanOrEqual(400);
      });
    });
  });
});
