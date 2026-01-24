import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processInput } from "@/lib/processors";
import { getPlanLimits, canCreateConversion, shouldAddWatermark } from "@/lib/config/plans";
import {
  convertRequestSchema,
  formatZodErrors,
} from "@/lib/validations";
import {
  DistribuiaError,
  UnauthenticatedError,
  ConversionLimitExceededError,
  ValidationError,
  YouTubeError,
  ArticleError,
  GroqAPIError,
} from "@/lib/errors";
import { sendLowUsageEmail, shouldSendEmail } from "@/lib/email/send";
import { conversionRatelimit, checkRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/csrf";
import { invalidateUserCache } from "@/lib/cache";
import logger from "@/lib/logger";
import type { ToneType, User, Conversion } from "@/types/database";

// Internal secret for triggering background processing
const INTERNAL_SECRET = process.env.CRON_SECRET;

/**
 * Trigger background processing for a conversion.
 * Uses fire-and-forget pattern - doesn't wait for response.
 */
async function triggerBackgroundProcessing(conversionId: string, baseUrl: string) {
  try {
    // Fire-and-forget request to process endpoint
    fetch(`${baseUrl}/api/conversion/${conversionId}/process`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${INTERNAL_SECRET}`,
        "Content-Type": "application/json",
      },
    }).catch((err) => {
      // Log but don't throw - this is fire-and-forget
      logger.error("Failed to trigger background processing", err, { conversionId });
    });
  } catch (error) {
    logger.error("Error triggering background processing", error, { conversionId });
  }
}

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  try {
    // Rate limiting check (before auth to prevent abuse)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip");
    const rateLimitResult = await checkRateLimit(conversionRatelimit, getRateLimitIdentifier(null, ip));

    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Demasiadas solicitudes. Por favor, espera un momento.",
            retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const parseResult = convertRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = formatZodErrors(parseResult.error);
      return NextResponse.json(
        new ValidationError("Datos de entrada no válidos", errors).toJSON(),
        { status: 400 }
      );
    }

    const { inputType, inputValue, tone, topics } = parseResult.data;

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthenticatedError();
    }

    // Get user data and check limits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single<User>();

    if (userError || !userData) {
      throw new UnauthenticatedError();
    }

    // Check conversion limit
    const planLimits = getPlanLimits(userData.plan);
    if (!canCreateConversion(userData.plan, userData.conversions_used_this_month)) {
      throw new ConversionLimitExceededError(
        planLimits.conversionsPerMonth,
        planLimits.name
      );
    }

    // Process input (extract content from YouTube, article, or text)
    // This happens synchronously as it's usually fast and needed before we can create the conversion
    logger.debug("Processing input", { inputType, inputValueLength: inputValue.length });
    const processedInput = await processInput(inputType, inputValue);
    logger.debug("Processed input", { source: processedInput.source, contentLength: processedInput.content.length });

    // Create conversion with 'pending' status
    const { data: conversion, error: conversionError } = await supabase
      .from("conversions")
      .insert({
        user_id: user.id,
        input_type: inputType,
        input_url: inputType !== "text" ? inputValue : null,
        input_text: processedInput.content,
        tone: tone as ToneType,
        topics: topics || null,
        status: "pending",
      })
      .select()
      .single<Conversion>();

    if (conversionError || !conversion) {
      logger.error("Error saving conversion", conversionError);
      throw new Error("Error al guardar la conversión");
    }

    // Increment user's conversion count immediately
    // (We count it now because the slot is reserved)
    const newUsageCount = userData.conversions_used_this_month + 1;
    const { error: updateError } = await supabase
      .from("users")
      .update({
        conversions_used_this_month: newUsageCount,
      })
      .eq("id", user.id);

    if (updateError) {
      logger.error("Error updating user conversion count", updateError);
    }

    // Invalidate user cache
    invalidateUserCache(user.id).catch((err) => {
      logger.error("Failed to invalidate cache", err);
    });

    // Send low usage email at 80% if not already sent this cycle
    const usagePercent = (newUsageCount / planLimits.conversionsPerMonth) * 100;

    if (usagePercent >= 80 && !userData.low_usage_email_sent_this_cycle && user.email) {
      const canSendEmail = await shouldSendEmail(supabase, user.id);

      if (canSendEmail) {
        sendLowUsageEmail(
          user.email,
          newUsageCount,
          planLimits.conversionsPerMonth,
          userData.plan,
          user.id
        ).then(async (result) => {
          if (result.success) {
            await supabase
              .from("users")
              .update({ low_usage_email_sent_this_cycle: true })
              .eq("id", user.id);
            logger.info("Low usage email sent", { email: user.email });
          } else {
            logger.error("Failed to send low usage email", new Error(result.error || "Unknown error"));
          }
        });
      }
    }

    // Get base URL for internal API calls
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      `https://${request.headers.get("host")}`;

    // Trigger background processing (fire-and-forget)
    triggerBackgroundProcessing(conversion.id, baseUrl);

    // Return immediately with conversion ID
    // Client will poll /api/conversion/[id]/status for updates
    return NextResponse.json({
      conversionId: conversion.id,
      status: "pending",
      source: processedInput.source,
      metadata: processedInput.metadata,
      mode: "background", // Indicates client should poll for results
      usage: {
        conversionsUsed: newUsageCount,
        conversionsLimit: planLimits.conversionsPerMonth,
        regeneratesPerConversion: planLimits.regeneratesPerConversion,
      },
      hasWatermark: shouldAddWatermark(userData.plan),
    });
  } catch (error) {
    logger.apiError("POST", "/api/convert", error, {
      errorName: error instanceof Error ? error.name : "Not an Error",
      errorConstructor: error?.constructor?.name,
      isDistribuiaError: error instanceof DistribuiaError,
    });

    // Handle our custom errors
    if (
      error instanceof DistribuiaError ||
      error instanceof YouTubeError ||
      error instanceof ArticleError ||
      error instanceof GroqAPIError
    ) {
      return NextResponse.json((error as DistribuiaError).toJSON(), { status: (error as DistribuiaError).statusCode });
    }

    // Check by duck typing
    if (error && typeof error === "object" && "code" in error && "toJSON" in error && typeof (error as DistribuiaError).toJSON === "function") {
      return NextResponse.json((error as DistribuiaError).toJSON(), { status: (error as DistribuiaError).statusCode || 400 });
    }

    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: `Error al procesar el contenido: ${errorMessage}`,
        },
      },
      { status: 500 }
    );
  }
}
