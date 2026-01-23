import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import {
  ArticleInvalidURLError,
  ArticlePaywallError,
  ArticleJSHeavyError,
  ArticleFetchError,
  ArticleParseError,
} from "@/lib/errors";

export interface ArticleResult {
  title: string;
  content: string;
  siteName: string;
  excerpt?: string;
  byline?: string;
}

// Common paywall indicators
const PAYWALL_INDICATORS = [
  "suscríbete para continuar",
  "subscribe to continue",
  "subscribe to read",
  "para seguir leyendo",
  "contenido exclusivo para suscriptores",
  "exclusive content for subscribers",
  "inicia sesión para leer",
  "log in to read",
  "paywall",
  "premium content",
  "contenido premium",
  "acceso restringido",
  "restricted access",
  "members only",
  "solo para miembros",
  "artículo completo disponible para",
  "full article available for",
];

// JS-heavy site indicators (content loaded dynamically)
const JS_HEAVY_INDICATORS = [
  "enable javascript",
  "javascript required",
  "please enable javascript",
  "activa javascript",
  "javascript necesario",
  "this page requires javascript",
  "loading...",
  "cargando...",
];

/**
 * Validate and normalize URL
 */
function validateUrl(url: string): URL {
  const trimmedUrl = url.trim();

  // Add protocol if missing
  let normalizedUrl = trimmedUrl;
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);

    // Ensure it's HTTP or HTTPS
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new ArticleInvalidURLError();
    }

    return parsedUrl;
  } catch (error) {
    if (error instanceof ArticleInvalidURLError) {
      throw error;
    }
    throw new ArticleInvalidURLError();
  }
}

/**
 * Check if content indicates a paywall
 */
function detectPaywall(html: string, textContent: string): boolean {
  const lowerHtml = html.toLowerCase();
  const lowerText = textContent.toLowerCase();

  // Check for paywall indicators
  for (const indicator of PAYWALL_INDICATORS) {
    if (lowerHtml.includes(indicator) || lowerText.includes(indicator)) {
      return true;
    }
  }

  // Check for very short content with subscription prompts
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  if (wordCount < 100) {
    const hasSubscribeButton =
      lowerHtml.includes("subscribe") ||
      lowerHtml.includes("suscribir") ||
      lowerHtml.includes("suscríbete");
    if (hasSubscribeButton) {
      return true;
    }
  }

  return false;
}

/**
 * Check if content indicates a JS-heavy site
 */
function detectJSHeavySite(html: string, textContent: string): boolean {
  const lowerHtml = html.toLowerCase();
  const lowerText = textContent.toLowerCase();

  // Check for JS requirement indicators
  for (const indicator of JS_HEAVY_INDICATORS) {
    if (lowerHtml.includes(indicator) || lowerText.includes(indicator)) {
      return true;
    }
  }

  // Check for SPA frameworks with empty content
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const hasReactRoot = lowerHtml.includes('id="root"') || lowerHtml.includes('id="app"');
  const hasEmptyMain = lowerHtml.includes("<main></main>") || lowerHtml.includes('<main id=');

  if (wordCount < 50 && (hasReactRoot || hasEmptyMain)) {
    return true;
  }

  return false;
}

/**
 * Extract main content from article URL
 */
export async function extractArticleContent(url: string): Promise<ArticleResult> {
  // Validate URL
  const validatedUrl = validateUrl(url);

  try {
    // Fetch the HTML
    const response = await fetch(validatedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new ArticleFetchError("La página no existe (404).");
      }
      if (response.status === 403) {
        throw new ArticlePaywallError();
      }
      throw new ArticleFetchError(`Error HTTP ${response.status}.`);
    }

    const html = await response.text();

    // Parse HTML with JSDOM
    const dom = new JSDOM(html, { url: validatedUrl.toString() });
    const document = dom.window.document;

    // Get raw text content for analysis
    const bodyText = document.body?.textContent || "";

    // Check for JS-heavy site (before paywall, as it might be a false positive)
    if (detectJSHeavySite(html, bodyText)) {
      throw new ArticleJSHeavyError();
    }

    // Check for paywall
    if (detectPaywall(html, bodyText)) {
      throw new ArticlePaywallError();
    }

    // Use Readability to extract content
    const reader = new Readability(document, {
      charThreshold: 100,
    });

    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.trim().length < 100) {
      throw new ArticleParseError();
    }

    // Clean up the content
    const content = article.textContent
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    // Extract site name from URL if not available
    const siteName =
      article.siteName ||
      validatedUrl.hostname.replace("www.", "").split(".")[0];

    return {
      title: article.title || "Sin título",
      content,
      siteName: siteName.charAt(0).toUpperCase() + siteName.slice(1),
      excerpt: article.excerpt || undefined,
      byline: article.byline || undefined,
    };
  } catch (error) {
    // Re-throw our custom errors
    if (
      error instanceof ArticleInvalidURLError ||
      error instanceof ArticlePaywallError ||
      error instanceof ArticleJSHeavyError ||
      error instanceof ArticleFetchError ||
      error instanceof ArticleParseError
    ) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ArticleFetchError("No se pudo conectar con el sitio web.");
    }

    // Handle unexpected errors
    throw new ArticleFetchError();
  }
}
