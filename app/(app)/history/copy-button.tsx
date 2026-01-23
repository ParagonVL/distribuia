"use client";

import { useState } from "react";

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = content;
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
