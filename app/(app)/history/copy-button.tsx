"use client";

import { useState } from "react";

// Watermark for free tier (must match server-side)
const WATERMARK = {
  x_thread: "\n\n---\n🔗 Creado con Distribuia.es",
  linkedin_post: "\n\n🔗 Creado con Distribuia.es",
  linkedin_article: "\n\n---\n\n*Creado con [Distribuia.es](https://distribuia.es)*",
} as const;

type OutputFormat = "x_thread" | "linkedin_post" | "linkedin_article";

interface CopyButtonProps {
  content: string;
  format?: OutputFormat;
  plan?: "free" | "starter" | "pro";
}

export function CopyButton({ content, format, plan }: CopyButtonProps) {
  // Add watermark for free tier
  const contentToCopy = plan === "free" && format
    ? content + WATERMARK[format]
    : content;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = contentToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`mt-2 px-3 py-1 text-xs font-medium border rounded transition-colors ${
        copied
          ? "text-success border-success/30 bg-success/5"
          : "text-primary hover:text-primary-dark border-primary/30 hover:bg-primary/5"
      }`}
    >
      {copied ? "Copiado!" : "Copiar contenido completo"}
    </button>
  );
}
