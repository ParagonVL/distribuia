import { NextRequest, NextResponse } from "next/server";

/**
 * CSRF Protection for API routes
 *
 * Uses the "Custom Header" method which is effective because:
 * 1. Browsers cannot add custom headers to cross-origin requests without CORS preflight
 * 2. Simple CORS requests (form submissions) cannot include custom headers
 * 3. Even if CORS allows the origin, the header requirement provides defense-in-depth
 *
 * This protects against:
 * - Cross-site form submissions
 * - Cross-site XMLHttpRequest/fetch without our custom header
 */

const CSRF_HEADER_NAME = "X-Requested-With";
const CSRF_HEADER_VALUE = "XMLHttpRequest";

/**
 * Validates CSRF protection header
 * @returns Error response if validation fails, null if valid
 */
export function validateCSRF(request: NextRequest): NextResponse | null {
  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (safeMethod) {
    return null;
  }

  const headerValue = request.headers.get(CSRF_HEADER_NAME);

  if (headerValue !== CSRF_HEADER_VALUE) {
    return NextResponse.json(
      {
        error: {
          code: "CSRF_VALIDATION_FAILED",
          message: "Invalid or missing CSRF header",
        },
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 */
export function withCSRFProtection<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;

    const csrfError = validateCSRF(request);
    if (csrfError) {
      return csrfError;
    }

    return handler(...args);
  }) as T;
}

/**
 * Client-side helper: Default headers to include in fetch requests
 */
export const CSRF_HEADERS = {
  [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
} as const;
