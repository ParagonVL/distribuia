import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processInput } from "@/lib/processors";
import { generateAllFormats } from "@/lib/groq";
import { getPlanLimits, canCreateConversion, addWatermarkIfNeeded, shouldAddWatermark } from "@/lib/config/plans";
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
import type { OutputFormat, ToneType, User, Conversion, Output } from "@/types/database";

// Extend timeout for this route (Vercel Pro: up to 300s, Hobby: 10s max)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  try {
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

    // Rate limiting by user ID (2 conversions per 5 minutes to respect Groq limits)
    const rateLimitResult = await checkRateLimit(conversionRatelimit, user.id);
    if (rateLimitResult && !rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Has alcanzado el límite de conversiones. Por favor, espera ${retryAfter} segundos.`,
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      );
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

    // Set user context for Sentry error tracking
    logger.setUser({
      id: user.id,
      email: user.email,
      plan: userData.plan,
    });
    logger.setTags({
      inputType,
      plan: userData.plan,
    });

    // Check conversion limit
    const planLimits = getPlanLimits(userData.plan);
    if (!canCreateConversion(userData.plan, userData.conversions_used_this_month)) {
      throw new ConversionLimitExceededError(
        planLimits.conversionsPerMonth,
        planLimits.name
      );
    }

    // Process input (extract content from YouTube, article, or text)
    logger.debug("Processing input", { inputType, inputValueLength: inputValue.length });
    const processedInput = await processInput(inputType, inputValue);
    logger.debug("Processed input", { source: processedInput.source, contentLength: processedInput.content.length });

    // Generate all three formats in parallel
    const generatedContent = await generateAllFormats(
      processedInput.content,
      tone as ToneType,
      topics || undefined
    );

    // Save conversion to database
    const { data: conversion, error: conversionError } = await supabase
      .from("conversions")
      .insert({
        user_id: user.id,
        input_type: inputType,
        input_url: inputType !== "text" ? inputValue : null,
        input_text: processedInput.content,
        tone: tone as ToneType,
        topics: topics || null,
      })
      .select()
      .single<Conversion>();

    if (conversionError || !conversion) {
      logger.error("Error saving conversion", conversionError);
      throw new Error("Error al guardar la conversión");
    }

    // Save all outputs
    const outputFormats: OutputFormat[] = [
      "x_thread",
      "linkedin_post",
      "linkedin_article",
    ];

    const outputInserts = outputFormats.map((format) => ({
      conversion_id: conversion.id,
      format,
      content: generatedContent[format].content,
      version: 1,
    }));

    const { data: outputs, error: outputsError } = await supabase
      .from("outputs")
      .insert(outputInserts)
      .select<"*", Output>();

    if (outputsError || !outputs) {
      logger.error("Error saving outputs", outputsError);
      // Try to clean up the conversion
      await supabase.from("conversions").delete().eq("id", conversion.id);
      throw new Error("Error al guardar los outputs");
    }

    // Increment user's conversion count
    const newUsageCount = userData.conversions_used_this_month + 1;
    const { error: updateError } = await supabase
      .from("users")
      .update({
        conversions_used_this_month: newUsageCount,
      })
      .eq("id", user.id);

    if (updateError) {
      logger.error("Error updating user conversion count", updateError);
      // Don't throw here, the conversion was successful
    }

    // Invalidate user cache (usage and history)
    invalidateUserCache(user.id).catch((err) => {
      logger.error("Failed to invalidate cache", err);
    });

    // Send low usage email at 80% if not already sent this cycle
    const usagePercent = (newUsageCount / planLimits.conversionsPerMonth) * 100;

    if (usagePercent >= 80 && !userData.low_usage_email_sent_this_cycle && user.email) {
      // Check email preferences before sending
      const canSendEmail = await shouldSendEmail(supabase, user.id);

      if (canSendEmail) {
        // Send email in background (don't await to avoid slowing down response)
        sendLowUsageEmail(
          user.email,
          newUsageCount,
          planLimits.conversionsPerMonth,
          userData.plan,
          user.id // Include userId for unsubscribe link
        ).then(async (result) => {
          if (result.success) {
            // Mark as sent
            await supabase
              .from("users")
              .update({ low_usage_email_sent_this_cycle: true })
              .eq("id", user.id);
            logger.info("Low usage email sent", { email: user.email });
          } else {
            logger.error("Failed to send low usage email", new Error(result.error || "Unknown error"));
          }
        });
      } else {
        logger.info("Skipping low usage email - user has opted out", { userId: user.id });
      }
    }

    // Format response (add watermark for free tier)
    const outputsByFormat = outputs.reduce(
      (acc, output) => {
        const format = output.format as "x_thread" | "linkedin_post" | "linkedin_article";
        acc[output.format] = {
          id: output.id,
          content: addWatermarkIfNeeded(output.content, format, userData.plan),
          version: output.version,
        };
        return acc;
      },
      {} as Record<string, { id: string; content: string; version: number }>
    );

    return NextResponse.json({
      conversionId: conversion.id,
      source: processedInput.source,
      metadata: processedInput.metadata,
      outputs: {
        x_thread: outputsByFormat.x_thread,
        linkedin_post: outputsByFormat.linkedin_post,
        linkedin_article: outputsByFormat.linkedin_article,
      },
      usage: {
        conversionsUsed: userData.conversions_used_this_month + 1,
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

    // Handle our custom errors (try multiple checks due to potential module boundary issues)
    if (
      error instanceof DistribuiaError ||
      error instanceof YouTubeError ||
      error instanceof ArticleError ||
      error instanceof GroqAPIError
    ) {
      return NextResponse.json((error as DistribuiaError).toJSON(), { status: (error as DistribuiaError).statusCode });
    }

    // Check if it's one of our errors by duck typing (in case instanceof fails)
    if (error && typeof error === "object" && "code" in error && "toJSON" in error && typeof (error as DistribuiaError).toJSON === "function") {
      return NextResponse.json((error as DistribuiaError).toJSON(), { status: (error as DistribuiaError).statusCode || 400 });
    }

    // Handle unexpected errors with more detail
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
