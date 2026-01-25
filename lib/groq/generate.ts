import { groqChatCompletion, GROQ_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "./client";
import { getPromptForFormat, getUserPrompt } from "./prompts";
import { GroqAPIError, GroqRateLimitError } from "@/lib/errors";
import type { OutputFormat, ToneType } from "@/types/database";

// Maximum content length to send to the API (roughly 5K tokens = ~20K chars)
const MAX_CONTENT_LENGTH = 20000;

// Retry configuration for connection errors
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a connection/network error that should be retried
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("connection") ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("socket") ||
      message.includes("fetch failed") ||
      message.includes("rate limit") // Also retry rate limits after delay
    );
  }
  return false;
}

/**
 * Truncate content to avoid exceeding token limits
 */
function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) {
    return content;
  }

  // Truncate at a sentence boundary if possible
  const truncated = content.substring(0, MAX_CONTENT_LENGTH);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclamation = truncated.lastIndexOf("!");

  const cutPoint = Math.max(lastPeriod, lastQuestion, lastExclamation);

  if (cutPoint > MAX_CONTENT_LENGTH * 0.8) {
    return truncated.substring(0, cutPoint + 1);
  }

  return truncated + "...";
}

export interface GenerationResult {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface GenerateAllResult {
  x_thread: GenerationResult;
  linkedin_post: GenerationResult;
  linkedin_article: GenerationResult;
}

/**
 * Generate content for a single format
 */
export async function generateContent(
  content: string,
  format: OutputFormat,
  tone: ToneType,
  topics?: string[]
): Promise<GenerationResult> {
  // Truncate content to avoid token limits
  const truncatedContent = truncateContent(content);
  console.log(`[Groq] Generating ${format}, content length: ${content.length} -> ${truncatedContent.length}`);
  console.log(`[Groq] Using model: ${GROQ_MODEL}, temp: ${DEFAULT_TEMPERATURE}, max_tokens: ${DEFAULT_MAX_TOKENS}`);

  const systemPrompt = getPromptForFormat(format, tone, topics);
  const userPrompt = getUserPrompt(truncatedContent, format);

  let lastError: unknown;

  // Retry loop for connection errors
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Groq] Attempt ${attempt}/${MAX_RETRIES} for ${format}`);

      const completion = await groqChatCompletion({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
      });

      const generatedContent = completion.choices[0]?.message?.content;

      if (!generatedContent) {
        throw new GroqAPIError("No se recibió contenido de la API.");
      }

      console.log(`[Groq] Successfully generated ${format} on attempt ${attempt}`);

      return {
        content: generatedContent.trim(),
        tokensUsed: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      lastError = error;

      // Check if this is a retryable error (NOT rate limits - fail fast for those)
      const isRateLimit = error instanceof Error && error.message.toLowerCase().includes("rate limit");

      if (isRateLimit) {
        // Don't retry rate limits - fail fast to avoid Vercel timeout
        console.log(`[Groq] Rate limit hit on attempt ${attempt}, failing fast (no retry)`);
        break;
      }

      if (isRetryableError(error) && attempt < MAX_RETRIES) {
        // Exponential backoff for connection errors only
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`[Groq] Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Not retryable or out of retries, break to error handling
      break;
    }
  }

  // Error handling for the last error
  const error = lastError;
  {
    // Log the full error for debugging
    console.error("[Groq] Generation error details:", {
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      errorType: typeof error,
      errorKeys: error && typeof error === "object" ? Object.keys(error) : [],
    });

    // Handle rate limiting
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("rate limit") ||
        message.includes("rate_limit") ||
        message.includes("too many requests") ||
        message.includes("429")
      ) {
        throw new GroqRateLimitError();
      }

      // Handle other API errors
      if (
        message.includes("api") ||
        message.includes("groq") ||
        message.includes("model")
      ) {
        throw new GroqAPIError(error.message);
      }
    }

    // Re-throw our custom errors
    if (error instanceof GroqAPIError || error instanceof GroqRateLimitError) {
      throw error;
    }

    // Unknown error - include the message for debugging
    const errorMsg = error instanceof Error ? error.message : "Error desconocido";
    throw new GroqAPIError(errorMsg);
  }
}

// Delay between API calls to allow rate limit tokens to replenish
const DELAY_BETWEEN_CALLS = 15000; // 15 seconds

/**
 * Generate content for all three formats sequentially with delays
 * 15s delays allow ~3K tokens to replenish (12K TPM = 200 tokens/sec)
 * Total time: ~42 seconds (within Vercel 60s timeout)
 */
export async function generateAllFormats(
  content: string,
  tone: ToneType,
  topics?: string[]
): Promise<GenerateAllResult> {
  console.log("[Groq] Starting SEQUENTIAL generation with delays");

  const x_thread = await generateContent(content, "x_thread", tone, topics);

  console.log(`[Groq] Waiting ${DELAY_BETWEEN_CALLS/1000}s for rate limit to replenish...`);
  await sleep(DELAY_BETWEEN_CALLS);

  const linkedin_post = await generateContent(content, "linkedin_post", tone, topics);

  console.log(`[Groq] Waiting ${DELAY_BETWEEN_CALLS/1000}s for rate limit to replenish...`);
  await sleep(DELAY_BETWEEN_CALLS);

  const linkedin_article = await generateContent(content, "linkedin_article", tone, topics);

  console.log("[Groq] All formats generated successfully");

  return {
    x_thread,
    linkedin_post,
    linkedin_article,
  };
}

/**
 * Regenerate content for a specific format
 */
export async function regenerateContent(
  content: string,
  format: OutputFormat,
  tone: ToneType,
  topics?: string[],
  previousContent?: string
): Promise<GenerationResult> {
  // Add instruction to generate different content if we have previous content
  let enhancedContent = content;

  if (previousContent) {
    enhancedContent = `${content}

---VERSIÓN ANTERIOR (genera algo DIFERENTE)---
${previousContent.substring(0, 500)}...
---FIN VERSIÓN ANTERIOR---

IMPORTANTE: Genera una versión completamente diferente. Usa otro enfoque, otro gancho, otra estructura.`;
  }

  return generateContent(enhancedContent, format, tone, topics);
}
