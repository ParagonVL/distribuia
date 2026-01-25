"use client";

import { useState } from "react";
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
import { GenerationProgress } from "@/components/ui/generation-progress";
import { useTopics, useConversion } from "./hooks";

type InputType = "youtube" | "article" | "text";
type ToneType = "profesional" | "cercano" | "tecnico";

interface ConversionFormProps {
  canConvert: boolean;
  remaining: number;
  hasWatermark: boolean;
  plan: "free" | "starter" | "pro";
}

const TABS: { id: InputType; label: string }[] = [
  { id: "youtube", label: "YouTube" },
  { id: "article", label: "Articulo" },
  { id: "text", label: "Texto" },
];

const TONES: { id: ToneType; label: string; description: string }[] = [
  { id: "profesional", label: "Profesional", description: "Formal, basado en datos, terminologia del sector" },
  { id: "cercano", label: "Cercano", description: "Personal, conversacional, conecta emocionalmente" },
  { id: "tecnico", label: "Tecnico", description: "Jerga especializada, detallado, experto a experto" },
];

export function ConversionForm({
  canConvert: initialCanConvert,
  remaining: initialRemaining,
  hasWatermark,
  plan: _plan,
}: ConversionFormProps) {
  const [activeTab, setActiveTab] = useState<InputType>("youtube");
  const [inputValue, setInputValue] = useState("");
  const [tone, setTone] = useState<ToneType>("profesional");

  const {
    topics,
    topicInput,
    setTopicInput,
    addTopic,
    removeTopic,
    clearTopics,
    canAddMore,
  } = useTopics();

  const {
    isLoading,
    error,
    result,
    canConvert,
    remaining,
    submit,
    clearError,
    reset,
    initialRemaining: limitRemaining,
  } = useConversion({ initialCanConvert, initialRemaining });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(activeTab, inputValue, tone, topics);
  };

  const handleNewConversion = () => {
    reset();
    setInputValue("");
    clearTopics();
  };

  const handleTabChange = (tabId: InputType) => {
    setActiveTab(tabId);
    setInputValue("");
    clearError();
  };

  // Show progress animation while generating
  if (isLoading) {
    return <GenerationProgress inputType={activeTab} />;
  }

  // Show error states for critical errors
  if (error) {
    switch (error.type) {
      case "YOUTUBE_NO_CAPTIONS":
        return <NoCaptionsError onRetry={clearError} />;
      case "ARTICLE_FETCH_ERROR":
        return <ArticleScrapingError onRetry={clearError} />;
      case "CONVERSION_LIMIT_EXCEEDED":
        return (
          <PlanLimitError
            conversionsUsed={limitRemaining === 0 ? remaining : remaining}
            conversionsLimit={limitRemaining}
            planName="actual"
          />
        );
      case "GROQ_API_ERROR":
        return <GenerationError onRetry={clearError} />;
      case "RATE_LIMIT_EXCEEDED":
        return <RateLimitErrorState retryAfter={error.retryAfter} onRetry={clearError} />;
      default:
        return (
          <GenericError
            message={error.message}
            code={error.code}
            onRetry={clearError}
            onReset={handleNewConversion}
          />
        );
    }
  }

  if (result) {
    return <Results result={result} onNewConversion={handleNewConversion} />;
  }

  const selectedTone = TONES.find((t) => t.id === tone);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-lg shadow-primary/30">
          <svg aria-hidden="true" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
          Nueva conversion
        </h1>
      </div>

      {/* Limit reached warning - shown at top when no conversions left */}
      {!canConvert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg aria-hidden="true" className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-amber-700 font-semibold">Has alcanzado el limite de tu plan</p>
                <p className="text-sm text-gray-600 mt-1">Desbloquea mas conversiones para seguir creando contenido</p>
              </div>
            </div>
            <motion.a
              href="/billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-teal-400 hover:from-primary-dark hover:to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all whitespace-nowrap"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Mejora tu plan
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      )}

      {/* Watermark notice for free users - only show when they can still convert */}
      {hasWatermark && canConvert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg aria-hidden="true" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-navy font-medium">Tu contenido incluye marca de agua</p>
                <p className="text-sm text-gray-600 mt-0.5">Mejora tu plan para eliminar &quot;Creado con Distribuia.com&quot;</p>
              </div>
            </div>
            <motion.a
              href="/billing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-teal-400 hover:from-primary-dark hover:to-teal-500 text-white font-semibold rounded-lg shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ver planes
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab buttons */}
      <div
        className="flex gap-2 p-1.5 bg-gradient-to-r from-gray-100 to-primary/10 rounded-xl w-fit shadow-inner"
        role="tablist"
        aria-label="Tipo de contenido"
      >
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
      <div className="card-accent">
        <InputPanel
          activeTab={activeTab}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isLoading={isLoading}
        />
      </div>

      {/* Tone selector */}
      <div className="card">
        <fieldset>
          <legend className="block text-sm font-medium text-navy mb-3">
            Tono del contenido
          </legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar tono">
            {TONES.map((t) => (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                disabled={isLoading}
                aria-pressed={tone === t.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
        </fieldset>
        {selectedTone && (
          <p className="mt-2 text-xs text-gray-600">{selectedTone.description}</p>
        )}
      </div>

      {/* Topics input */}
      <div className="card">
        <label htmlFor="topics" className="block text-sm font-medium text-navy mb-2">
          Temas clave (opcional)
        </label>
        <TopicsList topics={topics} onRemove={removeTopic} isLoading={isLoading} />
        <input
          id="topics"
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={addTopic}
          placeholder={canAddMore ? "Escribe y pulsa coma para anadir..." : "Maximo 5 temas"}
          className="input"
          disabled={isLoading || !canAddMore}
          aria-describedby="topics-hint"
        />
        <p id="topics-hint" className="mt-1 text-xs text-gray-600">
          Los temas se integraran naturalmente en el contenido generado
        </p>
      </div>

      {/* Submit button */}
      <SubmitSection
        canConvert={canConvert}
        isLoading={isLoading}
        inputValue={inputValue}
        remaining={remaining}
      />
      </form>
    </div>
  );
}

// Sub-components for better organization

function InputPanel({
  activeTab,
  inputValue,
  setInputValue,
  isLoading,
}: {
  activeTab: InputType;
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
}) {
  if (activeTab === "youtube") {
    return (
      <div>
        <label htmlFor="youtube-url" className="block text-sm font-medium text-navy mb-2">
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
    );
  }

  if (activeTab === "article") {
    return (
      <div>
        <label htmlFor="article-url" className="block text-sm font-medium text-navy mb-2">
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
    );
  }

  return (
    <div>
      <label htmlFor="text-content" className="block text-sm font-medium text-navy mb-2">
        Contenido
      </label>
      <textarea
        id="text-content"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Pega aqui el contenido que quieres transformar..."
        className="input min-h-[200px] resize-y"
        disabled={isLoading}
        aria-describedby="text-content-hint"
      />
      <p id="text-content-hint" className="mt-1 text-xs text-gray-600">
        Minimo 100 palabras, maximo 50.000 caracteres
      </p>
    </div>
  );
}

function TopicsList({
  topics,
  onRemove,
  isLoading,
}: {
  topics: string[];
  onRemove: (topic: string) => void;
  isLoading: boolean;
}) {
  if (topics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {topics.map((topic) => (
        <span
          key={topic}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-navy rounded-full text-sm"
        >
          {topic}
          <button
            type="button"
            onClick={() => onRemove(topic)}
            className="hover:text-error focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
            disabled={isLoading}
            aria-label={`Eliminar tema: ${topic}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
  );
}

function SubmitSection({
  canConvert,
  isLoading,
  inputValue,
  remaining,
}: {
  canConvert: boolean;
  isLoading: boolean;
  inputValue: string;
  remaining: number;
}) {
  // If limit reached, don't show the submit button (warning is shown at the top)
  if (!canConvert) {
    return null;
  }

  const isDisabled = isLoading || !inputValue.trim();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <motion.button
        type="submit"
        disabled={isDisabled}
        className={`w-full sm:w-auto px-8 py-3.5 rounded-lg font-semibold transition-all ${
          isDisabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-primary to-teal-400 hover:from-primary-dark hover:to-teal-500 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50"
        }`}
        whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
      <p className="text-sm text-gray-600">
        {remaining} {remaining === 1 ? "conversion restante" : "conversiones restantes"}
      </p>
    </div>
  );
}
