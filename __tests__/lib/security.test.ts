import {
  escapeHtml,
  sanitizeText,
  sanitizeUrl,
  generateCsrfToken,
  validateCsrfToken,
} from "@/lib/security";

describe("escapeHtml", () => {
  it("should escape HTML special characters", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
    );
  });

  it("should escape ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("should escape quotes", () => {
    expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("should escape single quotes", () => {
    expect(escapeHtml("It's fine")).toBe("It&#x27;s fine");
  });

  it("should handle empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("should leave normal text unchanged", () => {
    expect(escapeHtml("Hello world")).toBe("Hello world");
  });

  it("should handle Spanish characters", () => {
    expect(escapeHtml("Hola, cmo ests?")).toBe("Hola, cmo ests?");
  });
});

describe("sanitizeText", () => {
  it("should remove HTML tags", () => {
    expect(sanitizeText("<p>Hello</p>")).toBe("Hello");
  });

  it("should remove script tags", () => {
    expect(sanitizeText("<script>alert('xss')</script>")).toBe("alert('xss')");
  });

  it("should handle nested tags", () => {
    expect(sanitizeText("<div><p>Hello</p></div>")).toBe("Hello");
  });

  it("should trim whitespace", () => {
    expect(sanitizeText("  hello world  ")).toBe("hello world");
  });

  it("should handle empty strings", () => {
    expect(sanitizeText("")).toBe("");
  });

  it("should preserve text without tags", () => {
    expect(sanitizeText("Plain text")).toBe("Plain text");
  });

  it("should handle self-closing tags", () => {
    expect(sanitizeText("Hello<br/>World")).toBe("HelloWorld");
  });

  it("should handle malformed tags", () => {
    expect(sanitizeText("Hello<div>World")).toBe("HelloWorld");
  });
});

describe("sanitizeUrl", () => {
  it("should accept valid http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
  });

  it("should accept valid https URLs", () => {
    expect(sanitizeUrl("https://example.com/path")).toBe("https://example.com/path");
  });

  it("should accept URLs with query strings", () => {
    expect(sanitizeUrl("https://example.com?foo=bar")).toBe("https://example.com/?foo=bar");
  });

  it("should accept URLs with fragments", () => {
    expect(sanitizeUrl("https://example.com#section")).toBe("https://example.com/#section");
  });

  it("should reject javascript: URLs", () => {
    expect(sanitizeUrl("javascript:alert('xss')")).toBeNull();
  });

  it("should reject data: URLs", () => {
    expect(sanitizeUrl("data:text/html,<script>alert('xss')</script>")).toBeNull();
  });

  it("should reject file: URLs", () => {
    expect(sanitizeUrl("file:///etc/passwd")).toBeNull();
  });

  it("should reject invalid URLs", () => {
    expect(sanitizeUrl("not a url")).toBeNull();
  });

  it("should handle empty strings", () => {
    expect(sanitizeUrl("")).toBeNull();
  });

  it("should accept YouTube URLs", () => {
    expect(sanitizeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
  });

  it("should accept short YouTube URLs", () => {
    expect(sanitizeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://youtu.be/dQw4w9WgXcQ");
  });
});

describe("generateCsrfToken", () => {
  it("should generate a 64-character hex string", () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("should generate unique tokens", () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });
});

describe("validateCsrfToken", () => {
  it("should return true for matching tokens", () => {
    const token = generateCsrfToken();
    expect(validateCsrfToken(token, token)).toBe(true);
  });

  it("should return false for different tokens", () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(validateCsrfToken(token1, token2)).toBe(false);
  });

  it("should return false for null request token", () => {
    const sessionToken = generateCsrfToken();
    expect(validateCsrfToken(null, sessionToken)).toBe(false);
  });

  it("should return false for null session token", () => {
    const requestToken = generateCsrfToken();
    expect(validateCsrfToken(requestToken, null)).toBe(false);
  });

  it("should return false for both null tokens", () => {
    expect(validateCsrfToken(null, null)).toBe(false);
  });

  it("should return false for different length tokens", () => {
    expect(validateCsrfToken("short", "muchlongertoken")).toBe(false);
  });

  it("should return false for empty strings (falsy values)", () => {
    // Empty strings are falsy, so validation fails
    expect(validateCsrfToken("", "")).toBe(false);
    expect(validateCsrfToken("", "a")).toBe(false);
    expect(validateCsrfToken("a", "")).toBe(false);
  });
});
