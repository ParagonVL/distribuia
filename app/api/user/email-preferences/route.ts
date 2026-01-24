import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateUnsubscribeToken } from "@/lib/email/token";
import { validateCSRF } from "@/lib/csrf";
import { checkRateLimit, unsubscribeRatelimit } from "@/lib/ratelimit";
import logger from "@/lib/logger";

/**
 * GET /api/user/email-preferences
 * Get current email preferences
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email_notifications_enabled")
      .eq("id", user.id)
      .single();

    if (userError) {
      logger.error("Error fetching email preferences", userError);
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Error al obtener preferencias" } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      emailNotificationsEnabled: userData?.email_notifications_enabled ?? true,
    });
  } catch (error) {
    logger.error("Error getting email preferences", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Error interno" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/email-preferences
 * Update email preferences
 */
export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailNotificationsEnabled } = body;

    if (typeof emailNotificationsEnabled !== "boolean") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Valor invalido" } },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ email_notifications_enabled: emailNotificationsEnabled })
      .eq("id", user.id);

    if (updateError) {
      logger.error("Error updating email preferences", updateError);
      return NextResponse.json(
        { error: { code: "UPDATE_ERROR", message: "Error al actualizar" } },
        { status: 500 }
      );
    }

    logger.info("Email preferences updated", {
      userId: user.id,
      enabled: emailNotificationsEnabled,
    });

    return NextResponse.json({
      success: true,
      emailNotificationsEnabled,
    });
  } catch (error) {
    logger.error("Error updating email preferences", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Error interno" } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/email-preferences?token=xxx&user=yyy
 * One-click unsubscribe from emails (for email links)
 */
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const userId = url.searchParams.get("user");

    if (!token || !userId) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Token invalido" } },
        { status: 400 }
      );
    }

    // Rate limit by token to prevent abuse
    const rateLimitResult = await checkRateLimit(unsubscribeRatelimit, token);
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Demasiadas solicitudes" } },
        { status: 429 }
      );
    }

    // Validate token using HMAC-SHA256 with constant-time comparison
    if (!validateUnsubscribeToken(userId, token)) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Token invalido" } },
        { status: 400 }
      );
    }

    // Use admin client to update without auth
    const supabaseAdmin = createAdminClient();

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ email_notifications_enabled: false })
      .eq("id", userId);

    if (updateError) {
      logger.error("Error unsubscribing user", updateError);
      return NextResponse.json(
        { error: { code: "UPDATE_ERROR", message: "Error al actualizar" } },
        { status: 500 }
      );
    }

    logger.info("User unsubscribed via email link", { userId });

    return NextResponse.json({
      success: true,
      message: "Te has dado de baja de los emails de notificacion.",
    });
  } catch (error) {
    logger.error("Error processing unsubscribe", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Error interno" } },
      { status: 500 }
    );
  }
}