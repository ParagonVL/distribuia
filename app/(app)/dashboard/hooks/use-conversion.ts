import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/error-toast";

type InputType = "youtube" | "article" | "text";
type ToneType = "profesional" | "cercano" | "tecnico";

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

// Polling configuration
const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_ATTEMPTS = 60; // Max 3 minutes of polling

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

  // Polling state
  const [completedFormats, setCompletedFormats] = useState<string[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
  }, []);

  const pollStatus = useCallback(async (
    conversionId: string,
    metadata: ConversionResult["metadata"],
    usage: ConversionResult["usage"],
    hasWatermark: boolean | undefined,
    source: ConversionResult["source"]
  ) => {
    try {
      const response = await fetch(`/api/conversion/${conversionId}/status`, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Error al verificar el estado");
      }

      const data = await response.json();

      // Update completed formats for progress indication
      if (data.completedFormats) {
        setCompletedFormats(data.completedFormats);
      }

      // Check if completed
      if (data.status === "completed" && data.outputs) {
        stopPolling();
        setResult({
          conversionId,
          source: data.source || source,
          metadata: data.metadata || metadata,
          outputs: data.outputs,
          usage: data.usage || usage,
          hasWatermark: data.hasWatermark ?? hasWatermark,
        });
        setIsLoading(false);
        toast.showSuccess("Contenido generado correctamente");
        router.refresh();
        return;
      }

      // Check if failed
      if (data.status === "failed") {
        stopPolling();
        setError({
          type: "GROQ_API_ERROR",
          message: data.error || "Error al generar el contenido",
        });
        setIsLoading(false);
        return;
      }

      // Increment poll attempts and check limit
      pollAttemptsRef.current++;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setError({
          type: "GENERIC",
          message: "La generación está tardando demasiado. Por favor, inténtalo de nuevo.",
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Polling error:", err);
      // Don't stop polling on network errors - keep trying
      pollAttemptsRef.current++;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setError({
          type: "GENERIC",
          message: err instanceof Error ? err.message : "Error de conexión",
        });
        setIsLoading(false);
      }
    }
  }, [stopPolling, router]);

  const startPolling = useCallback((
    conversionId: string,
    metadata: ConversionResult["metadata"],
    usage: ConversionResult["usage"],
    hasWatermark: boolean | undefined,
    source: ConversionResult["source"]
  ) => {
    // Reset state
    pollAttemptsRef.current = 0;
    setCompletedFormats([]);

    // Start polling
    pollIntervalRef.current = setInterval(() => {
      pollStatus(conversionId, metadata, usage, hasWatermark, source);
    }, POLL_INTERVAL);

    // Also poll immediately
    pollStatus(conversionId, metadata, usage, hasWatermark, source);
  }, [pollStatus]);

  const submit = useCallback(async (
    inputType: InputType,
    inputValue: string,
    tone: ToneType,
    topics: string[]
  ) => {
    if (!canConvert || !inputValue.trim()) return;

    setIsLoading(true);
    setError(null);
    setCompletedFormats([]);

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
        console.error("Failed to parse response:", text);
        throw new Error("Respuesta inválida del servidor");
      }

      if (!response.ok) {
        const errorCode = data.error?.code || "INTERNAL_ERROR";
        const errorMessage = data.error?.message || "Error al procesar el contenido";
        const errorType = getErrorType(errorCode);

        // For minor validation errors, show toast instead of full error state
        if (errorCode === "VALIDATION_ERROR" || errorCode === "TEXT_TOO_SHORT" || errorCode === "TEXT_TOO_LONG") {
          toast.showError(errorMessage);
          setIsLoading(false);
          return;
        }

        setError({
          type: errorType,
          message: errorMessage,
          code: errorCode,
          retryAfter: data.error?.retryAfter,
        });
        setIsLoading(false);
        return;
      }

      // Update remaining count immediately
      setRemaining((prev) => Math.max(0, prev - 1));
      if (remaining <= 1) {
        setCanConvert(false);
      }

      // Check if this is background mode (new flow)
      if (data.mode === "background") {
        // Start polling for results
        startPolling(
          data.conversionId,
          data.metadata,
          data.usage,
          data.hasWatermark,
          data.source
        );
        return;
      }

      // Legacy flow: results returned directly
      setResult(data);
      setIsLoading(false);
      toast.showSuccess("Contenido generado correctamente");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError({
        type: "GENERIC",
        message,
      });
      setIsLoading(false);
    }
  }, [canConvert, remaining, router, startPolling]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    stopPolling();
  }, [stopPolling]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setCompletedFormats([]);
    stopPolling();
  }, [stopPolling]);

  return {
    isLoading,
    error,
    result,
    canConvert,
    remaining,
    completedFormats, // Expose for progress UI
    submit,
    clearResult,
    clearError,
    reset,
    initialRemaining,
  };
}
