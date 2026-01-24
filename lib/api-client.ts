/**
 * Client-side API utilities with CSRF protection
 *
 * All state-changing requests to our API routes should use these helpers
 * to ensure CSRF protection is applied consistently.
 */

const CSRF_HEADER_NAME = "X-Requested-With";
const CSRF_HEADER_VALUE = "XMLHttpRequest";

/**
 * Default headers for API requests including CSRF protection
 */
export const API_HEADERS = {
  [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
} as const;

/**
 * Headers for JSON API requests with CSRF protection
 */
export const JSON_API_HEADERS = {
  ...API_HEADERS,
  "Content-Type": "application/json",
} as const;

/**
 * Make a CSRF-protected fetch request to the API
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  // Add CSRF header for non-GET requests
  if (!["GET", "HEAD", "OPTIONS"].includes((options.method || "GET").toUpperCase())) {
    headers.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make a CSRF-protected POST request with JSON body
 */
export async function apiPost<T = unknown>(
  url: string,
  body: unknown
): Promise<{ data: T | null; error: string | null; response: Response }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: JSON_API_HEADERS,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.error?.message || "Error de servidor",
        response,
      };
    }

    return { data, error: null, response };
  } catch {
    return {
      data: null,
      error: "Error de conexion",
      response: new Response(null, { status: 0 }),
    };
  }
}

/**
 * Make a CSRF-protected DELETE request
 */
export async function apiDelete<T = unknown>(
  url: string
): Promise<{ data: T | null; error: string | null; response: Response }> {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: API_HEADERS,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.error?.message || "Error de servidor",
        response,
      };
    }

    return { data, error: null, response };
  } catch {
    return {
      data: null,
      error: "Error de conexion",
      response: new Response(null, { status: 0 }),
    };
  }
}
