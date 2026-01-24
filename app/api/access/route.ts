import { NextRequest, NextResponse } from "next/server";
import { validateCSRF } from "@/lib/csrf";

// Must match the token in middleware.ts
const SITE_ACCESS_TOKEN = process.env.SITE_ACCESS_TOKEN || null;

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  try {
    const { token } = await request.json();

    if (token === SITE_ACCESS_TOKEN) {
      const response = NextResponse.json({ success: true });

      // Set cookie that expires in 30 days
      response.cookies.set("site_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
