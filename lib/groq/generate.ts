import { groq, GROQ_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "./client";
import { getPromptForFormat, getUserPrompt } from "./prompts";
import { GroqAPIError, GroqRateLimitError } from "@/lib/errors";
import type { OutputFormat, ToneType } from "@/types/database";

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
  const systemPrompt = getPromptForFormat(format, tone, topics);
  const userPrompt = getUserPrompt(content, format);

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
 * Generate content for all three formats in parallel
 */
export async function generateAllFormats(
  content: string,
  tone: ToneType,
  topics?: string[]
): Promise<GenerateAllResult> {
  const formats: OutputFormat[] = ["x_thread", "linkedin_post", "linkedin_article"];

  // Run all generations in parallel
  const results = await Promise.all(
    formats.map((format) => generateContent(content, format, tone, topics))
  );

  return {
    x_thread: results[0],
    linkedin_post: results[1],
    linkedin_article: results[2],
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
