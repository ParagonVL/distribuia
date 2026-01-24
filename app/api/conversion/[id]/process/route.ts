import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateContent } from "@/lib/groq/generate";
import logger from "@/lib/logger";
import type { OutputFormat, ToneType, Conversion } from "@/types/database";

// Secret to validate internal calls
const INTERNAL_SECRET = process.env.CRON_SECRET;

/**
 * POST /api/conversion/[id]/process
 *
 * Internal endpoint to process a pending conversion in the background.
 * Called by the convert API after creating the conversion record.
 * Uses service role to bypass RLS.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify internal call
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${INTERNAL_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Get the conversion
    const { data: conversion, error: fetchError } = await supabase
      .from("conversions")
      .select("*")
      .eq("id", id)
      .single<Conversion>();

    if (fetchError || !conversion) {
      logger.error("Conversion not found for processing", fetchError, { id });
      return NextResponse.json({ error: "Conversion not found" }, { status: 404 });
    }

    // Check if already processed
    if (conversion.status === "completed" || conversion.status === "failed") {
      return NextResponse.json({ status: conversion.status, message: "Already processed" });
    }

    // Update status to processing
    await supabase
      .from("conversions")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("id", id);

    const formats: OutputFormat[] = ["x_thread", "linkedin_post", "linkedin_article"];
    const tone = conversion.tone as ToneType;
    const topics = conversion.topics || undefined;
    const content = conversion.input_text;

    logger.info("Starting background generation", { conversionId: id, formats: formats.length });

    // Process each format sequentially (with delays to avoid rate limits)
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];

      try {
        logger.info(`Generating ${format}`, { conversionId: id, formatIndex: i + 1 });

        const result = await generateContent(content, format, tone, topics);

        // Save output immediately so client can see progress
        const { error: outputError } = await supabase
          .from("outputs")
          .insert({
            conversion_id: id,
            format,
            content: result.content,
            version: 1,
          });

        if (outputError) {
          logger.error(`Failed to save ${format} output`, outputError, { conversionId: id });
        } else {
          logger.info(`Saved ${format} output`, { conversionId: id });
        }

        // Wait between API calls to avoid rate limits (except after last one)
        if (i < formats.length - 1) {
          const delay = 15000; // 15 seconds
          logger.info(`Waiting ${delay/1000}s before next format...`, { conversionId: id });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (formatError) {
        logger.error(`Error generating ${format}`, formatError, { conversionId: id });

        // Update conversion with error
        await supabase
          .from("conversions")
          .update({
            status: "failed",
            error_message: formatError instanceof Error ? formatError.message : "Error de generación",
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);

        return NextResponse.json({
          status: "failed",
          error: formatError instanceof Error ? formatError.message : "Error de generación",
        });
      }
    }

    // Mark as completed
    await supabase
      .from("conversions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    logger.info("Background generation completed", { conversionId: id });

    return NextResponse.json({ status: "completed" });
  } catch (error) {
    logger.error("Background processing error", error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

// Increase timeout for this endpoint (Vercel Pro: 60s, Hobby: 10s)
export const maxDuration = 120; // Request up to 2 minutes
