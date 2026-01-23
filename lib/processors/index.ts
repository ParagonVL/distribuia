import { extractYouTubeTranscript, type YouTubeResult } from "./youtube";
import { processRawText, type TextResult } from "./text";
import type { InputType } from "@/types/database";
import { ValidationError } from "@/lib/errors";

// Dynamic import for article processor to avoid jsdom ESM issues
async function getArticleExtractor() {
  const { extractArticleContent } = await import("./article");
  return extractArticleContent;
}

export interface ArticleResult {
  title: string;
  content: string;
  siteName: string;
  excerpt?: string;
  byline?: string;
}

export interface ProcessedInput {
  source: InputType;
  content: string;
  metadata: {
    title?: string;
    duration?: number;
    siteName?: string;
    videoId?: string;
    wordCount?: number;
    characterCount?: number;
    excerpt?: string;
    byline?: string;
  };
}

export type { YouTubeResult, TextResult };
export { extractYouTubeTranscript } from "./youtube";
export { processRawText, estimateReadingTime, extractKeywords } from "./text";

/**
 * Unified input processor that handles all input types
 */
export async function processInput(
  type: InputType,
  input: string
): Promise<ProcessedInput> {
  if (!input || input.trim().length === 0) {
    throw new ValidationError("El contenido no puede estar vacío.", {
      input: ["Se requiere contenido para procesar"],
    });
  }

  const trimmedInput = input.trim();

  switch (type) {
    case "youtube": {
      const result = await extractYouTubeTranscript(trimmedInput);
      return {
        source: "youtube",
        content: result.transcript,
        metadata: {
          title: result.title,
          duration: result.duration,
          videoId: result.videoId,
        },
      };
    }

    case "article": {
      // Dynamic import to avoid jsdom ESM compatibility issues
      const extractArticleContent = await getArticleExtractor();
      const result = await extractArticleContent(trimmedInput);
      return {
        source: "article",
        content: result.content,
        metadata: {
          title: result.title,
          siteName: result.siteName,
          excerpt: result.excerpt,
          byline: result.byline,
        },
      };
    }

    case "text": {
      const result = processRawText(trimmedInput);
      return {
        source: "text",
        content: result.content,
        metadata: {
          wordCount: result.wordCount,
          characterCount: result.characterCount,
        },
      };
    }

    default: {
      throw new ValidationError(`Tipo de entrada no válido: ${type}`, {
        type: ["Debe ser 'youtube', 'article' o 'text'"],
      });
    }
  }
}

/**
 * Detect input type from the input string
 */
export function detectInputType(input: string): InputType {
  const trimmed = input.trim();

  // Check for YouTube URLs
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch/,
    /(?:https?:\/\/)?youtu\.be\//,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\//,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\//,
    /(?:https?:\/\/)?m\.youtube\.com\/watch/,
    /(?:https?:\/\/)?music\.youtube\.com\/watch/,
  ];

  for (const pattern of youtubePatterns) {
    if (pattern.test(trimmed)) {
      return "youtube";
    }
  }

  // Check if it looks like a URL (article)
  const urlPattern = /^(?:https?:\/\/)?(?:[\w-]+\.)+[\w-]+(?:\/[\w\-./?%&=]*)?$/;
  if (urlPattern.test(trimmed) || trimmed.startsWith("http")) {
    return "article";
  }

  // Default to text
  return "text";
}
