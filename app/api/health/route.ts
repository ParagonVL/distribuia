import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Health check endpoint for monitoring and uptime checks
 */
export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "unknown",
  };

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
