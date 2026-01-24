import { createHmac } from "crypto";

const TOKEN_SECRET_KEY = "SUPABASE_WEBHOOK_SECRET";

/**
 * Get the secret key for token generation
 * Falls back to a default only in development
 */
function getSecretKey(): string {
  const secret = process.env[TOKEN_SECRET_KEY];
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(`${TOKEN_SECRET_KEY} must be set in production`);
  }
  return secret || "dev-secret-do-not-use-in-production";
}

/**
 * Generate a cryptographically secure unsubscribe token using HMAC-SHA256
 * @param userId - The user ID to generate token for
 * @returns A secure token string
 */
export function generateUnsubscribeToken(userId: string): string {
  const secret = getSecretKey();
  const hmac = createHmac("sha256", secret);
  hmac.update(userId);
  return hmac.digest("hex").slice(0, 32); // Use first 32 chars for URL friendliness
}

/**
 * Validate an unsubscribe token
 * @param userId - The user ID the token was generated for
 * @param token - The token to validate
 * @returns true if token is valid
 */
export function validateUnsubscribeToken(userId: string, token: string): boolean {
  if (!userId || !token) {
    return false;
  }

  const expectedToken = generateUnsubscribeToken(userId);

  // Constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a full unsubscribe URL
 * @param userId - The user ID
 * @returns Full unsubscribe URL
 */
export function getUnsubscribeUrl(userId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://distribuia.com";
  const token = generateUnsubscribeToken(userId);
  return `${baseUrl}/api/user/email-preferences?token=${token}&user=${userId}`;
}
