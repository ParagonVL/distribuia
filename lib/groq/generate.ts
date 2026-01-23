import { groq, GROQ_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "./client";
import { getPromptForFormat, getUserPrompt } from "./prompts";
import { GroqAPIError, GroqRateLimitError } from "@/lib/errors";
import type { OutputFormat, ToneType } from "@/types/database";

// Maximum content length to send to the API (roughly 5K tokens = ~20K chars)
const MAX_CONTENT_LENGTH = 20000;

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

  const systemPrompt = getPromptForFormat(format, tone, topics);
  const userPrompt = getUserPrompt(truncatedContent, format);

  try {
    const completion = await groq.chat.completions.create({
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

    return {
      content: generatedContent.trim(),
      tokensUsed: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
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

    // Unknown error
    throw new GroqAPIError();
  }
}

/**
 * Generate content for all three formats sequentially to avoid rate limits
 */
export async function generateAllFormats(
  content: string,
  tone: ToneType,
  topics?: string[]
): Promise<GenerateAllResult> {
  console.log("[Groq] Starting sequential generation for all formats");

  // Run generations sequentially to avoid rate limits with large content
  const x_thread = await generateContent(content, "x_thread", tone, topics);
  const linkedin_post = await generateContent(content, "linkedin_post", tone, topics);
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
