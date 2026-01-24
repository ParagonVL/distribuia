/**
 * Security utilities for XSS prevention and CSRF protection
 */

/**
 * HTML entities for escaping
 */
const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escape HTML special characters to prevent XSS
 * Use this when displaying user-generated content as text
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize plain text by removing HTML tags
 * Use this for user input that should only contain plain text
 */
export function sanitizeText(dirty: string): string {
  // Remove all HTML tags
  return dirty.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validate and sanitize a URL to prevent javascript: and data: attacks
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(
  requestToken: string | null,
  sessionToken: string | null
): boolean {
  if (!requestToken || !sessionToken) {
    return false;
  }
  // Constant-time comparison to prevent timing attacks
  if (requestToken.length !== sessionToken.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < requestToken.length; i++) {
    result |= requestToken.charCodeAt(i) ^ sessionToken.charCodeAt(i);
  }
  return result === 0;
}
