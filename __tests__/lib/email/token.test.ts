import {
  generateUnsubscribeToken,
  validateUnsubscribeToken,
  getUnsubscribeUrl,
} from "@/lib/email/token";

describe("Email Token Utilities", () => {
  const testUserId = "test-user-123";
  const testUserId2 = "different-user-456";

  describe("generateUnsubscribeToken", () => {
    it("should generate a token string", () => {
      const token = generateUnsubscribeToken(testUserId);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate consistent tokens for the same user", () => {
      const token1 = generateUnsubscribeToken(testUserId);
      const token2 = generateUnsubscribeToken(testUserId);
      expect(token1).toBe(token2);
    });

    it("should generate different tokens for different users", () => {
      const token1 = generateUnsubscribeToken(testUserId);
      const token2 = generateUnsubscribeToken(testUserId2);
      expect(token1).not.toBe(token2);
    });

    it("should generate 32-character hex tokens", () => {
      const token = generateUnsubscribeToken(testUserId);
      expect(token.length).toBe(32);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });
  });

  describe("validateUnsubscribeToken", () => {
    it("should validate correct tokens", () => {
      const token = generateUnsubscribeToken(testUserId);
      const isValid = validateUnsubscribeToken(testUserId, token);
      expect(isValid).toBe(true);
    });

    it("should reject invalid tokens", () => {
      const isValid = validateUnsubscribeToken(testUserId, "invalid-token");
      expect(isValid).toBe(false);
    });

    it("should reject tokens from different users", () => {
      const token = generateUnsubscribeToken(testUserId);
      const isValid = validateUnsubscribeToken(testUserId2, token);
      expect(isValid).toBe(false);
    });

    it("should reject empty tokens", () => {
      expect(validateUnsubscribeToken(testUserId, "")).toBe(false);
    });

    it("should reject empty user IDs", () => {
      const token = generateUnsubscribeToken(testUserId);
      expect(validateUnsubscribeToken("", token)).toBe(false);
    });

    it("should handle null-like values gracefully", () => {
      expect(validateUnsubscribeToken(testUserId, null as unknown as string)).toBe(false);
      expect(validateUnsubscribeToken(null as unknown as string, "token")).toBe(false);
    });

    it("should reject tokens with wrong length", () => {
      // Token is too short
      expect(validateUnsubscribeToken(testUserId, "abc")).toBe(false);
      // Token is too long
      expect(validateUnsubscribeToken(testUserId, "a".repeat(64))).toBe(false);
    });
  });

  describe("getUnsubscribeUrl", () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

    afterEach(() => {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    });

    it("should generate a valid unsubscribe URL", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
      const url = getUnsubscribeUrl(testUserId);

      expect(url).toContain("https://example.com/api/user/email-preferences");
      expect(url).toContain("token=");
      expect(url).toContain(`user=${testUserId}`);
    });

    it("should use default domain when env is not set", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const url = getUnsubscribeUrl(testUserId);

      expect(url).toContain("https://distribuia.es/api/user/email-preferences");
    });

    it("should include a valid token in the URL", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
      const url = getUnsubscribeUrl(testUserId);
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get("token");
      const userId = urlObj.searchParams.get("user");

      expect(token).toBeTruthy();
      expect(userId).toBe(testUserId);
      expect(validateUnsubscribeToken(userId!, token!)).toBe(true);
    });
  });
});
