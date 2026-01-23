"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Results } from "./results";
import {
  NoCaptionsError,
  ArticleScrapingError,
  PlanLimitError,
  GenerationError,
  GenericError,
  RateLimitErrorState,
} from "./error-states";
import { toast } from "@/components/ui/error-toast";
import { GenerationProgress } from "@/components/ui/generation-progress";

type InputType = "youtube" | "article" | "text";
type ToneType = "profesional" | "cercano" | "tecnico";

// Error code to component mapping
type ErrorType =
  | "YOUTUBE_NO_CAPTIONS"
  | "ARTICLE_FETCH_ERROR"
  | "ARTICLE_PARSE_ERROR"
  | "CONVERSION_LIMIT_EXCEEDED"
  | "GROQ_API_ERROR"
  | "GROQ_RATE_LIMIT"
  | "RATE_LIMIT_EXCEEDED"
  | "GENERIC";

interface ConversionFormProps {
  canConvert: boolean;
  remaining: number;
}

interface ConversionOutput {
  id: string;
  content: string;
  version: number;
}

interface ConversionResult {
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
}

interface ErrorState {
  type: ErrorType;
  message: string;
  code?: string;
  retryAfter?: number;
}

export function ConversionForm({
  canConvert: initialCanConvert,
  remaining: initialRemaining,
}: ConversionFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InputType>("youtube");
  const [inputValue, setInputValue] = useState("");
  const [tone, setTone] = useState<ToneType>("profesional");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [canConvert, setCanConvert] = useState(initialCanConvert);
  const [remaining, setRemaining] = useState(initialRemaining);

  const tabs: { id: InputType; label: string }[] = [
    { id: "youtube", label: "YouTube" },
    { id: "article", label: "Articulo" },
    { id: "text", label: "Texto" },
  ];

  const tones: { id: ToneType; label: string }[] = [
    { id: "profesional", label: "Profesional" },
    { id: "cercano", label: "Cercano" },
    { id: "tecnico", label: "Tecnico" },
  ];

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "," || e.key === "Enter") && topicInput.trim()) {
      e.preventDefault();
      const newTopic = topicInput.trim().replace(/,/g, "");
      if (newTopic && topics.length < 5 && !topics.includes(newTopic)) {
        setTopics([...topics, newTopic]);
      }
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  const getErrorType = (code: string): ErrorType => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConvert || !inputValue.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: activeTab,
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
      // Refresh to update header usage count
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
  };

  const handleNewConversion = () => {
    setResult(null);
    setInputValue("");
    setTopics([]);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
  };

  // Show progress animation while generating
  if (isLoading) {
    return <GenerationProgress inputType={activeTab} />;
  }

  // Show error states for critical errors
  if (error) {
    switch (error.type) {
      case "YOUTUBE_NO_CAPTIONS":
        return <NoCaptionsError onRetry={handleRetry} />;
      case "ARTICLE_FETCH_ERROR":
        return <ArticleScrapingError onRetry={handleRetry} />;
      case "CONVERSION_LIMIT_EXCEEDED":
        return (
          <PlanLimitError
            conversionsUsed={initialRemaining === 0 ? remaining : remaining}
            conversionsLimit={initialRemaining}
            planName="actual"
          />
        );
      case "GROQ_API_ERROR":
        return <GenerationError onRetry={handleRetry} />;
      case "RATE_LIMIT_EXCEEDED":
        return <RateLimitErrorState retryAfter={error.retryAfter} onRetry={handleRetry} />;
      default:
        return (
          <GenericError
            message={error.message}
            code={error.code}
            onRetry={handleRetry}
            onReset={handleNewConversion}
          />
        );
    }
  }

  if (result) {
    return (
      <Results
        result={result}
        onNewConversion={handleNewConversion}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setInputValue("");
              setError(null);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "text-navy hover:bg-gray-200"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Input area */}
      <div className="card">
        {activeTab === "youtube" && (
          <div>
            <label
              htmlFor="youtube-url"
              className="block text-sm font-medium text-navy mb-2"
            >
              URL del video de YouTube
            </label>
            <input
              id="youtube-url"
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="input"
              disabled={isLoading}
            />
          </div>
        )}

        {activeTab === "article" && (
          <div>
            <label
              htmlFor="article-url"
              className="block text-sm font-medium text-navy mb-2"
            >
              URL del articulo
            </label>
            <input
              id="article-url"
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://ejemplo.com/articulo"
              className="input"
              disabled={isLoading}
            />
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <label
              htmlFor="text-content"
              className="block text-sm font-medium text-navy mb-2"
            >
              Contenido
            </label>
            <textarea
              id="text-content"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pega aqui el contenido que quieres transformar..."
              className="input min-h-[200px] resize-y"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimo 100 palabras, maximo 50.000 caracteres
            </p>
          </div>
        )}
      </div>

      {/* Tone selector */}
      <div className="card">
        <label className="block text-sm font-medium text-navy mb-3">
          Tono del contenido
        </label>
        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tone === t.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-navy hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={tone === t.id ? { scale: [1, 1.05, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {tone === "profesional" &&
            "Formal, basado en datos, terminologia del sector"}
          {tone === "cercano" &&
            "Personal, conversacional, conecta emocionalmente"}
          {tone === "tecnico" &&
            "Jerga especializada, detallado, experto a experto"}
        </p>
      </div>

      {/* Topics input */}
      <div className="card">
        <label
          htmlFor="topics"
          className="block text-sm font-medium text-navy mb-2"
        >
          Temas clave (opcional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-navy rounded-full text-sm"
            >
              {topic}
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic)}
                className="hover:text-error"
                disabled={isLoading}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <input
          id="topics"
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={handleAddTopic}
          placeholder={
            topics.length >= 5
              ? "Maximo 5 temas"
              : "Escribe y pulsa coma para anadir..."
          }
          className="input"
          disabled={isLoading || topics.length >= 5}
        />
        <p className="mt-1 text-xs text-gray-500">
          Los temas se integraran naturalmente en el contenido generado
        </p>
      </div>

      {/* Submit button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {canConvert ? (
          <motion.button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-colors ${
              isLoading || !inputValue.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white"
            }`}
            whileHover={!isLoading && inputValue.trim() ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isLoading && inputValue.trim() ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Convirtiendo...
              </span>
            ) : (
              "Convertir"
            )}
          </motion.button>
        ) : (
          <div className="w-full sm:w-auto text-center">
            <button
              type="button"
              disabled
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              Limite alcanzado
            </button>
            <a
              href="/billing"
              className="block mt-2 text-sm text-primary hover:text-primary-dark font-medium"
            >
              Mejora tu plan
            </a>
          </div>
        )}

        {canConvert && (
          <p className="text-sm text-gray-500">
            {remaining} {remaining === 1 ? "conversion restante" : "conversiones restantes"}
          </p>
        )}
      </div>
    </form>
  );
}
