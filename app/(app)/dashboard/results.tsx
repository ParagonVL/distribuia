"use client";

import { useState } from "react";

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

interface ResultsProps {
  result: ConversionResult;
  onNewConversion: () => void;
}

type OutputFormat = "x_thread" | "linkedin_post" | "linkedin_article";

const formatLabels: Record<OutputFormat, string> = {
  x_thread: "Hilo de X",
  linkedin_post: "Post de LinkedIn",
  linkedin_article: "Articulo",
};

function OutputCard({
  format,
  output,
  regeneratesPerConversion,
  sourceUrl,
}: {
  format: OutputFormat;
  output: ConversionOutput;
  regeneratesPerConversion: number;
  sourceUrl?: string;
}) {
  const [content, setContent] = useState(output.content);
  const [version, setVersion] = useState(output.version);
  const [outputId, setOutputId] = useState(output.id);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regeneratesRemaining = regeneratesPerConversion - version + 1;
  const canRegenerate = regeneratesRemaining > 0;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleCopy = async (includeSource = false) => {
    try {
      let textToCopy = content;
      if (includeSource && sourceUrl) {
        textToCopy = `${content}\n\nFuente: ${sourceUrl}`;
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Fallback copy failed:", e);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleRegenerate = async () => {
    if (!canRegenerate || isRegenerating) return;

    setIsRegenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputId,
          format,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al regenerar");
      }

      setContent(data.content);
      setVersion(data.version);
      setOutputId(data.outputId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsRegenerating(false);
    }
  };

  const [linkedInCopied, setLinkedInCopied] = useState(false);

  const handleOpenLinkedIn = async () => {
    // Prepare content with optional source
    const textToCopy = sourceUrl
      ? `${content}\n\nFuente: ${sourceUrl}`
      : content;

    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(textToCopy);
      setLinkedInCopied(true);
    } catch (err) {
      console.error("Clipboard API failed, trying fallback:", err);
      // Fallback for older browsers or permission issues
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setLinkedInCopied(true);
      } catch (e) {
        console.error("Fallback copy also failed:", e);
      }
      document.body.removeChild(textArea);
    }

    // Open LinkedIn feed in new tab
    window.open("https://www.linkedin.com/feed/", "_blank", "noopener,noreferrer");

    // Reset copied state after delay
    setTimeout(() => setLinkedInCopied(false), 3000);
  };

  const formatContent = (text: string) => {
    if (format === "x_thread") {
      // Split by --- for thread format
      const tweets = text.split(/---+/).map((t) => t.trim()).filter(Boolean);
      return (
        <div className="space-y-4">
          {tweets.map((tweet, i) => (
            <div
              key={i}
              className="p-3 bg-gray-50 rounded-lg border-l-2 border-primary"
            >
              <p className="text-sm text-gray-500 mb-1">Tweet {i + 1}</p>
              <p className="whitespace-pre-wrap">{tweet}</p>
              <p className="text-xs text-gray-400 mt-1">
                {tweet.length}/280 caracteres
              </p>
            </div>
          ))}
        </div>
      );
    }

    // For LinkedIn posts and articles, preserve formatting
    return <div className="whitespace-pre-wrap">{text}</div>;
  };

  return (
    <div className="card flex flex-col h-full">
      <h3 className="font-heading text-lg font-semibold text-navy mb-4">
        {formatLabels[format]}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 text-navy-light">
        {formatContent(content)}
      </div>

      <div className="border-t border-gray-100 pt-4 mt-auto">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-500">
            {wordCount} palabras · {charCount.toLocaleString("es-ES")} caracteres
          </p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver original
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCopy(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              copied
                ? "bg-success/10 border-success text-success"
                : "border-gray-300 text-navy hover:bg-gray-50"
            }`}
          >
            {copied ? (
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copiado!
              </span>
            ) : (
              "Copiar"
            )}
          </button>

          {format !== "x_thread" && (
            <button
              onClick={handleOpenLinkedIn}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
              title="Copia el contenido y abre LinkedIn"
            >
              {linkedInCopied ? (
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado - Pega en LinkedIn
                </span>
              ) : (
                "Abrir en LinkedIn"
              )}
            </button>
          )}

          <button
            onClick={handleRegenerate}
            disabled={!canRegenerate || isRegenerating}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              canRegenerate && !isRegenerating
                ? "text-primary hover:text-primary-dark"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {isRegenerating ? (
              <span className="inline-flex items-center gap-1">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Regenerando...
              </span>
            ) : canRegenerate ? (
              `Regenerar (${regeneratesRemaining} ${regeneratesRemaining === 1 ? "restante" : "restantes"})`
            ) : (
              "Sin regeneraciones"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Construct source URL from metadata
function getSourceUrl(source: string, metadata?: ConversionResult["metadata"]): string | undefined {
  if (source === "youtube" && metadata?.videoId) {
    return `https://www.youtube.com/watch?v=${metadata.videoId}`;
  }
  // For articles, the URL would need to be stored in metadata (future improvement)
  return undefined;
}

export function Results({ result, onNewConversion }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<OutputFormat>("x_thread");
  const formats: OutputFormat[] = ["x_thread", "linkedin_post", "linkedin_article"];
  const sourceUrl = getSourceUrl(result.source, result.metadata);

  const handleDownloadAll = () => {
    const content = formats
      .map((format) => {
        return `=== ${formatLabels[format].toUpperCase()} ===\n\n${result.outputs[format].content}`;
      })
      .join("\n\n" + "=".repeat(50) + "\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribuia-conversion-${result.conversionId.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">
            Contenido generado
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tu contenido esta listo. Puedes copiarlo, editarlo o regenerarlo.
          </p>
        </div>
        <button
          onClick={onNewConversion}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-navy hover:bg-gray-200 transition-colors"
        >
          Nueva conversion
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden mb-4">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => setActiveTab(format)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === format
                  ? "bg-primary text-white"
                  : "text-navy hover:bg-gray-200"
              }`}
            >
              {formatLabels[format].replace(" de ", "\n")}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: single card view */}
      <div className="sm:hidden">
        <OutputCard
          format={activeTab}
          output={result.outputs[activeTab]}
          regeneratesPerConversion={result.usage.regeneratesPerConversion}
          sourceUrl={sourceUrl}
        />
      </div>

      {/* Desktop: three column grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6">
        {formats.map((format) => (
          <OutputCard
            key={format}
            format={format}
            output={result.outputs[format]}
            regeneratesPerConversion={result.usage.regeneratesPerConversion}
            sourceUrl={sourceUrl}
          />
        ))}
      </div>

      {/* Download all button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleDownloadAll}
          className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-100 text-navy hover:bg-gray-200 transition-colors"
        >
          Descargar todo (.txt)
        </button>
      </div>
    </div>
  );
}
