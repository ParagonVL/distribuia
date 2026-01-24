# Background Processing for Vercel Pro

This document contains the code for background processing that requires Vercel Pro (60s+ timeout).

## When to Use

- After upgrading to Vercel Pro ($20/mo)
- Or when implementing Upstash QStash

## Files to Restore

### 1. app/api/conversion/[id]/process/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateContent } from "@/lib/groq/generate";
import logger from "@/lib/logger";
import type { OutputFormat, ToneType, Conversion } from "@/types/database";

// Secret to validate internal calls
const INTERNAL_SECRET = process.env.CRON_SECRET;

// Initial delay before starting generation (helps with rate limits after recent conversions)
const INITIAL_DELAY_MS = 5000; // 5 seconds

// Delay between format generations
const DELAY_BETWEEN_FORMATS_MS = 20000; // 20 seconds

// Max retries for rate limit errors
const MAX_FORMAT_RETRIES = 2;
const RETRY_DELAY_MS = 30000; // 30 seconds

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

    // Initial delay to help avoid rate limits from recent conversions
    logger.info(`Waiting ${INITIAL_DELAY_MS/1000}s before starting generation...`, { conversionId: id });
    await new Promise((resolve) => setTimeout(resolve, INITIAL_DELAY_MS));

    // Process each format sequentially (with delays to avoid rate limits)
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      let lastError: Error | null = null;

      // Retry loop for each format
      for (let attempt = 1; attempt <= MAX_FORMAT_RETRIES + 1; attempt++) {
        try {
          logger.info(`Generating ${format} (attempt ${attempt})`, { conversionId: id, formatIndex: i + 1 });

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

          // Success - break retry loop
          lastError = null;
          break;
        } catch (formatError) {
          lastError = formatError instanceof Error ? formatError : new Error(String(formatError));
          const isRateLimit = lastError.message.toLowerCase().includes("rate") ||
                             lastError.message.toLowerCase().includes("sobrecargado");

          logger.warn(`Error generating ${format} (attempt ${attempt}): ${lastError.message}`, {
            conversionId: id,
            isRateLimit,
            willRetry: attempt <= MAX_FORMAT_RETRIES && isRateLimit
          });

          // Only retry rate limit errors
          if (isRateLimit && attempt <= MAX_FORMAT_RETRIES) {
            logger.info(`Waiting ${RETRY_DELAY_MS/1000}s before retry...`, { conversionId: id });
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            continue;
          }

          // Non-retryable error or out of retries
          break;
        }
      }

      // If we exhausted retries, fail the conversion
      if (lastError) {
        logger.error(`Failed to generate ${format} after retries`, lastError, { conversionId: id });

        await supabase
          .from("conversions")
          .update({
            status: "failed",
            error_message: lastError.message,
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);

        return NextResponse.json({
          status: "failed",
          error: lastError.message,
        });
      }

      // Wait between API calls to avoid rate limits (except after last one)
      if (i < formats.length - 1) {
        logger.info(`Waiting ${DELAY_BETWEEN_FORMATS_MS/1000}s before next format...`, { conversionId: id });
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_FORMATS_MS));
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

// Increase timeout for this endpoint (Vercel Pro: 60s)
export const maxDuration = 120;
```

### 2. app/api/conversion/[id]/status/route.ts

Already exists - used for polling status during background processing.

### 3. Convert API Changes (app/api/convert/route.ts)

Replace synchronous generation with:

```typescript
// Trigger background processing (fire-and-forget)
async function triggerBackgroundProcessing(conversionId: string, baseUrl: string) {
  try {
    fetch(`${baseUrl}/api/conversion/${conversionId}/process`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    }).catch((err) => {
      logger.error("Failed to trigger background processing", err, { conversionId });
    });
  } catch (error) {
    logger.error("Error triggering background processing", error, { conversionId });
  }
}

// In POST handler, after creating conversion:
triggerBackgroundProcessing(conversion.id, baseUrl);

// Return immediately with mode: "background"
return NextResponse.json({
  conversionId: conversion.id,
  status: "pending",
  mode: "background",
  // ...
});
```

### 4. Client Hook Changes (app/(app)/dashboard/hooks/use-conversion.ts)

Add polling logic - see the full file in git history at commit 922026e.

### 5. Generation Progress Component

Update to accept `completedFormats` prop for real-time progress.

## Database Migration

Already applied - adds `status`, `error_message`, `started_at`, `completed_at` columns to conversions table.

## Requirements

- Vercel Pro plan (60s+ timeout) OR
- Upstash QStash for true background jobs
