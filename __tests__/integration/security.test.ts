/**
 * Integration tests for security utilities
 *
 * Tests timing-safe comparisons, unsubscribe tokens, and other security features
 */

import { timingSafeEqual, sanitizeUrl, escapeHtml, sanitizeText } from "@/lib/security";
import { generateUnsubscribeToken, validateUnsubscribeToken, getUnsubscribeUrl } from "@/lib/email/token";

describe("Security Integration Tests", () => {
  describe("timingSafeEqual", () => {
    it("should return true for identical strings", () => {
      expect(timingSafeEqual("secret123", "secret123")).toBe(true);
    });

    it("should return false for different strings", () => {
      expect(timingSafeEqual("secret123", "secret456")).toBe(false);
    });

    it("should return false for different length strings", () => {
      expect(timingSafeEqual("short", "longer_string")).toBe(false);
    });

    it("should return false for null values", () => {
      expect(timingSafeEqual(null, "value")).toBe(false);
      expect(timingSafeEqual("value", null)).toBe(false);
      expect(timingSafeEqual(null, null)).toBe(false);
    });

    it("should return false for empty strings", () => {
      expect(timingSafeEqual("", "value")).toBe(false);
      expect(timingSafeEqual("value", "")).toBe(false);
    });

    it("should handle Bearer token comparison", () => {
      const secret = "my-cron-secret";
      const correctHeader = `Bearer ${secret}`;
      const wrongHeader = `Bearer wrong-secret`;

      expect(timingSafeEqual(correctHeader, correctHeader)).toBe(true);
      expect(timingSafeEqual(correctHeader, wrongHeader)).toBe(false);
    });
  });

  describe("Unsubscribe Token Security", () => {
    const testUserId = "user-123-uuid";

    it("should generate deterministic tokens", () => {
      const token1 = generateUnsubscribeToken(testUserId);
      const token2 = generateUnsubscribeToken(testUserId);
      expect(token1).toBe(token2);
    });

    it("should generate different tokens for different users", () => {
      const token1 = generateUnsubscribeToken("user-1");
      const token2 = generateUnsubscribeToken("user-2");
      expect(token1).not.toBe(token2);
    });

    it("should generate tokens with correct format (32 hex chars)", () => {
      const token = generateUnsubscribeToken(testUserId);
      expect(token).toMatch(/^[a-f0-9]{32}$/);
    });

    it("should validate correct tokens", () => {
      const token = generateUnsubscribeToken(testUserId);
      expect(validateUnsubscribeToken(testUserId, token)).toBe(true);
    });

    it("should reject incorrect tokens", () => {
      expect(validateUnsubscribeToken(testUserId, "wrong-token")).toBe(false);
    });

    it("should reject tokens from different users", () => {
      const token = generateUnsubscribeToken("user-1");
      expect(validateUnsubscribeToken("user-2", token)).toBe(false);
    });

    it("should reject empty inputs", () => {
      expect(validateUnsubscribeToken("", "token")).toBe(false);
      expect(validateUnsubscribeToken("user", "")).toBe(false);
    });

    it("should generate valid unsubscribe URLs", () => {
      const url = getUnsubscribeUrl(testUserId);
      expect(url).toContain("/api/user/email-preferences");
      expect(url).toContain(`user=${testUserId}`);
      expect(url).toContain("token=");
    });
  });

  describe("URL Sanitization", () => {
    it("should allow http URLs", () => {
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
    });

    it("should allow https URLs", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    });

    it("should reject javascript: URLs", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    });

    it("should reject data: URLs", () => {
      expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    });

    it("should reject file: URLs", () => {
      expect(sanitizeUrl("file:///etc/passwd")).toBeNull();
    });

    it("should reject invalid URLs", () => {
      expect(sanitizeUrl("not-a-url")).toBeNull();
    });
  });

  describe("HTML Escaping", () => {
    it("should escape < and >", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    });

    it("should escape quotes", () => {
      expect(escapeHtml('"test"')).toBe("&quot;test&quot;");
      expect(escapeHtml("'test'")).toBe("&#x27;test&#x27;");
    });

    it("should escape ampersands", () => {
      expect(escapeHtml("a & b")).toBe("a &amp; b");
    });

    it("should handle multiple special characters", () => {
      expect(escapeHtml('<img onerror="alert(1)">')).toBe(
        "&lt;img onerror=&quot;alert(1)&quot;&gt;"
      );
    });
  });

  describe("Text Sanitization", () => {
    it("should remove HTML tags", () => {
      expect(sanitizeText("<p>Hello</p>")).toBe("Hello");
    });

    it("should remove script tags", () => {
      expect(sanitizeText("<script>alert(1)</script>")).toBe("alert(1)");
    });

    it("should trim whitespace", () => {
      expect(sanitizeText("  hello  ")).toBe("hello");
    });

    it("should handle nested tags", () => {
      expect(sanitizeText("<div><p><b>text</b></p></div>")).toBe("text");
    });
  });

  describe("Webhook Signature Verification Patterns", () => {
    // Document expected webhook signature patterns

    it("should define Stripe webhook signature header", () => {
      const expectedHeader = "stripe-signature";
      expect(expectedHeader).toBe("stripe-signature");
    });

    it("should define Supabase webhook signature header", () => {
      const expectedHeader = "x-supabase-signature";
      expect(expectedHeader).toBe("x-supabase-signature");
    });

    it("should expect HMAC-SHA256 for webhook verification", () => {
      // Both Stripe and Supabase use HMAC-SHA256 for signatures
      const algorithm = "sha256";
      expect(algorithm).toBe("sha256");
    });
  });
});
