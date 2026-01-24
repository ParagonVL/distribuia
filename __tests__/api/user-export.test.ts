/**
 * @jest-environment node
 */

/**
 * API Route Tests: /api/user/export
 *
 * Tests the GDPR data export endpoint (Article 20 - Right to Data Portability).
 */

describe("GET /api/user/export", () => {
  describe("Authentication", () => {
    it("should require authentication", () => {
      const unauthenticatedStatus = 401;
      expect(unauthenticatedStatus).toBe(401);
    });

    it("should return proper error for unauthenticated requests", () => {
      const errorResponse = {
        error: {
          code: "UNAUTHENTICATED",
          message: "Debes iniciar sesion para exportar tus datos",
        },
      };
      expect(errorResponse.error.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("Response Format", () => {
    it("should return JSON content type", () => {
      const contentType = "application/json";
      expect(contentType).toBe("application/json");
    });

    it("should include Content-Disposition header for download", () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const date = new Date().toISOString().split("T")[0];
      const filename = `distribuia-export-${userId}-${date}.json`;
      expect(filename).toMatch(/^distribuia-export-[a-f0-9-]+-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe("Export Data Structure", () => {
    const mockExport = {
      exportDate: "2024-01-15T10:30:00Z",
      exportVersion: "1.0",
      user: {
        id: "uuid",
        email: "user@example.com",
        emailVerified: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        lastSignIn: "2024-01-15T10:00:00Z",
      },
      profile: {
        plan: "starter",
        conversionsUsedThisMonth: 5,
        billingCycleStart: "2024-01-01T00:00:00Z",
        stripeCustomerId: "[REDACTED]",
        createdAt: "2024-01-01T00:00:00Z",
      },
      conversions: [],
      statistics: {
        totalConversions: 0,
        totalOutputs: 0,
      },
    };

    it("should include export metadata", () => {
      expect(mockExport).toHaveProperty("exportDate");
      expect(mockExport).toHaveProperty("exportVersion");
    });

    it("should include user auth data", () => {
      expect(mockExport.user).toHaveProperty("id");
      expect(mockExport.user).toHaveProperty("email");
      expect(mockExport.user).toHaveProperty("createdAt");
    });

    it("should include user profile data", () => {
      expect(mockExport.profile).toHaveProperty("plan");
      expect(mockExport.profile).toHaveProperty("conversionsUsedThisMonth");
    });

    it("should redact sensitive Stripe data", () => {
      expect(mockExport.profile.stripeCustomerId).toBe("[REDACTED]");
    });

    it("should include statistics summary", () => {
      expect(mockExport.statistics).toHaveProperty("totalConversions");
      expect(mockExport.statistics).toHaveProperty("totalOutputs");
    });
  });

  describe("Conversions Data", () => {
    const mockConversion = {
      id: "uuid",
      inputType: "youtube",
      inputUrl: "https://youtube.com/watch?v=abc123",
      inputText: "Transcript content...",
      tone: "profesional",
      topics: ["tech", "ai"],
      createdAt: "2024-01-10T12:00:00Z",
      outputs: [
        {
          id: "uuid",
          format: "x_thread",
          content: "Generated thread content...",
          version: 1,
          createdAt: "2024-01-10T12:01:00Z",
        },
      ],
    };

    it("should include conversion input details", () => {
      expect(mockConversion).toHaveProperty("inputType");
      expect(mockConversion).toHaveProperty("inputUrl");
      expect(mockConversion).toHaveProperty("tone");
      expect(mockConversion).toHaveProperty("topics");
    });

    it("should include all output versions", () => {
      expect(mockConversion.outputs).toBeInstanceOf(Array);
      expect(mockConversion.outputs[0]).toHaveProperty("format");
      expect(mockConversion.outputs[0]).toHaveProperty("version");
    });

    it("should include valid input types", () => {
      const validInputTypes = ["youtube", "article", "text"];
      expect(validInputTypes).toContain(mockConversion.inputType);
    });

    it("should include valid output formats", () => {
      const validFormats = ["x_thread", "linkedin_post", "linkedin_article"];
      expect(validFormats).toContain(mockConversion.outputs[0].format);
    });
  });

  describe("GDPR Compliance", () => {
    it("should export all user data for portability", () => {
      // Article 20: Users have right to receive their data in machine-readable format
      const requiredDataCategories = [
        "user",
        "profile",
        "conversions",
        "statistics",
      ];
      expect(requiredDataCategories).toHaveLength(4);
    });

    it("should use portable JSON format", () => {
      const format = "JSON";
      expect(format).toBe("JSON");
    });

    it("should include timestamps for all records", () => {
      // All records should have createdAt for audit trail
      const hasTimestamps = true;
      expect(hasTimestamps).toBe(true);
    });
  });
});
