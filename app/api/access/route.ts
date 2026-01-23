import { NextRequest, NextResponse } from "next/server";

// Must match the token in middleware.ts
const SITE_ACCESS_TOKEN = "distribuia2026";

export async function POST(request: NextRequest) {
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
