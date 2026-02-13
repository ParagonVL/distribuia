import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/error-toast";

type InputType = "youtube" | "article" | "text";
type ToneType = "profesional" | "cercano" | "tecnico" | "inspirador";

type ErrorType =
  | "YOUTUBE_NO_CAPTIONS"
  | "ARTICLE_FETCH_ERROR"
  | "ARTICLE_PARSE_ERROR"
  | "CONVERSION_LIMIT_EXCEEDED"
  | "GROQ_API_ERROR"
  | "GROQ_RATE_LIMIT"
  | "RATE_LIMIT_EXCEEDED"
  | "GENERIC";

interface ConversionOutput {
  id: string;
  content: string;
  version: number;
}

export interface ConversionResult {
  conversionId: string;
  source: "youtube" | "article" | "text";
  metadata?: {
    title?: string;
    videoId?: string;
    duration?: number;
    siteName?: string;
  };
  outputs: {
    x_thread: ConversionOutput;
    linkedin_post: ConversionOutput;
    linkedin_article: ConversionOutput;
  };
  usage: {
    conversionsUsed: number;
    conversionsLimit: number;
    regeneratesPerConversion: number;
  };
  hasWatermark?: boolean;
}

export interface ErrorState {
  type: ErrorType;
  message: string;
  code?: string;
  retryAfter?: number;
}

interface UseConversionProps {
  initialCanConvert: boolean;
  initialRemaining: number;
}

function getErrorType(code: string): ErrorType {
  if (code === "YOUTUBE_NO_CAPTIONS" || code === "YOUTUBE_PRIVATE_VIDEO" || code === "YOUTUBE_TRANSCRIPT_ERROR") {
    return "YOUTUBE_NO_CAPTIONS";
  }
  if (code === "ARTICLE_FETCH_ERROR" || code === "ARTICLE_PARSE_ERROR" || code === "ARTICLE_PAYWALL" || code === "ARTICLE_JS_HEAVY") {
    return "ARTICLE_FETCH_ERROR";
  }
  if (code === "CONVERSION_LIMIT_EXCEEDED" || code === "PLAN_LIMIT_EXCEEDED") {
    return "CONVERSION_LIMIT_EXCEEDED";
  }
  if (code === "GROQ_API_ERROR" || code === "GROQ_RATE_LIMIT") {
    return "GROQ_API_ERROR";
  }
  if (code === "RATE_LIMIT_EXCEEDED") {
    return "RATE_LIMIT_EXCEEDED";
  }
  return "GENERIC";
}

export function useConversion({ initialCanConvert, initialRemaining }: UseConversionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [canConvert, setCanConvert] = useState(initialCanConvert);
  const [remaining, setRemaining] = useState(initialRemaining);

  const submit = useCallback(async (
    inputType: InputType,
    inputValue: string,
    tone: ToneType,
    topics: string[]
  ) => {
    if (!canConvert || !inputValue.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          inputType,
          inputValue: inputValue.trim(),
          tone,
          topics: topics.length > 0 ? topics : null,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Failed to parse response:", text?.substring(0, 500));
        // Check if it's a Vercel timeout (returns HTML)
        if (text?.includes("FUNCTION_INVOCATION_TIMEOUT") || text?.includes("Task timed out")) {
          throw new Error("La generación tardó demasiado. Por favor, intenta con un contenido más corto.");
        }
        if (response.status === 504) {
          throw new Error("Tiempo de espera agotado. Por favor, intenta de nuevo.");
        }
        throw new Error("Respuesta inválida del servidor");
      }

      if (!response.ok) {
        const errorCode = data.error?.code || "INTERNAL_ERROR";
        const errorMessage = data.error?.message || "Error al procesar el contenido";
        const errorType = getErrorType(errorCode);

        // For minor validation errors, show toast instead of full error state
        if (errorCode === "VALIDATION_ERROR" || errorCode === "TEXT_TOO_SHORT" || errorCode === "TEXT_TOO_LONG") {
          toast.showError(errorMessage);
          return;
        }

        setError({
          type: errorType,
          message: errorMessage,
          code: errorCode,
          retryAfter: data.error?.retryAfter,
        });
        return;
      }

      setResult(data);
      setRemaining((prev) => Math.max(0, prev - 1));
      if (remaining <= 1) {
        setCanConvert(false);
      }
      toast.showSuccess("Contenido generado correctamente");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError({
        type: "GENERIC",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [canConvert, remaining, router]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    canConvert,
    remaining,
    submit,
    clearResult,
    clearError,
    reset,
    initialRemaining,
  };
}
