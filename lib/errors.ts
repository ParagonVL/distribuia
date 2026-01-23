// Base error class for Distribuia
export class DistribuiaError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = "DistribuiaError";
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, DistribuiaError.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

// YouTube-specific errors
export class YouTubeError extends DistribuiaError {
  constructor(message: string, code: string) {
    super(message, code, 400);
    this.name = "YouTubeError";
  }
}

export class YouTubeInvalidURLError extends YouTubeError {
  constructor() {
    super(
      "La URL de YouTube no es válida. Por favor, introduce una URL correcta.",
      "YOUTUBE_INVALID_URL"
    );
  }
}

export class YouTubeNoCaptionsError extends YouTubeError {
  constructor() {
    super(
      "Este vídeo no tiene subtítulos disponibles. Solo podemos procesar vídeos con subtítulos activados.",
      "YOUTUBE_NO_CAPTIONS"
    );
  }
}

export class YouTubePrivateVideoError extends YouTubeError {
  constructor() {
    super(
      "Este vídeo es privado o ha sido eliminado. Por favor, usa un vídeo público.",
      "YOUTUBE_PRIVATE_VIDEO"
    );
  }
}

export class YouTubeTranscriptError extends YouTubeError {
  constructor(details?: string) {
    super(
      `No se pudo obtener la transcripción del vídeo.${details ? ` ${details}` : ""}`,
      "YOUTUBE_TRANSCRIPT_ERROR"
    );
  }
}

// Article-specific errors
export class ArticleError extends DistribuiaError {
  constructor(message: string, code: string) {
    super(message, code, 400);
    this.name = "ArticleError";
  }
}

export class ArticleInvalidURLError extends ArticleError {
  constructor() {
    super(
      "La URL del artículo no es válida. Por favor, introduce una URL correcta.",
      "ARTICLE_INVALID_URL"
    );
  }
}

export class ArticlePaywallError extends ArticleError {
  constructor() {
    super(
      "Este artículo parece estar detrás de un muro de pago. No podemos acceder al contenido completo.",
      "ARTICLE_PAYWALL"
    );
  }
}

export class ArticleJSHeavyError extends ArticleError {
  constructor() {
    super(
      "Esta página requiere JavaScript para mostrar el contenido. Prueba a copiar y pegar el texto directamente.",
      "ARTICLE_JS_HEAVY"
    );
  }
}

export class ArticleFetchError extends ArticleError {
  constructor(details?: string) {
    super(
      `No se pudo obtener el contenido del artículo.${details ? ` ${details}` : ""}`,
      "ARTICLE_FETCH_ERROR"
    );
  }
}

export class ArticleParseError extends ArticleError {
  constructor() {
    super(
      "No se pudo extraer el contenido del artículo. Prueba a copiar y pegar el texto directamente.",
      "ARTICLE_PARSE_ERROR"
    );
  }
}

// Text processing errors
export class TextError extends DistribuiaError {
  constructor(message: string, code: string) {
    super(message, code, 400);
    this.name = "TextError";
  }
}

export class TextTooShortError extends TextError {
  constructor(wordCount: number) {
    super(
      `El texto es demasiado corto (${wordCount} palabras). Necesitas al menos 100 palabras para generar contenido de calidad.`,
      "TEXT_TOO_SHORT"
    );
  }
}

export class TextTooLongError extends TextError {
  constructor(charCount: number) {
    super(
      `El texto es demasiado largo (${charCount.toLocaleString("es-ES")} caracteres). El máximo permitido es 50.000 caracteres.`,
      "TEXT_TOO_LONG"
    );
  }
}

// Authentication & Authorization errors
export class AuthError extends DistribuiaError {
  constructor(message: string, code: string) {
    super(message, code, 401);
    this.name = "AuthError";
  }
}

export class UnauthenticatedError extends AuthError {
  constructor() {
    super(
      "Debes iniciar sesión para realizar esta acción.",
      "UNAUTHENTICATED"
    );
  }
}

// Usage & Limits errors
export class UsageError extends DistribuiaError {
  constructor(message: string, code: string) {
    super(message, code, 403);
    this.name = "UsageError";
  }
}

export class ConversionLimitExceededError extends UsageError {
  constructor(limit: number, plan: string) {
    super(
      `Has alcanzado el límite de ${limit} conversiones de tu plan ${plan}. Actualiza tu plan para continuar.`,
      "CONVERSION_LIMIT_EXCEEDED"
    );
  }
}

export class RegenerateLimitExceededError extends UsageError {
  constructor(limit: number) {
    super(
      `Has alcanzado el límite de ${limit} regeneraciones para este contenido.`,
      "REGENERATE_LIMIT_EXCEEDED"
    );
  }
}

// Generation errors
export class GenerationError extends DistribuiaError {
  constructor(message: string, code: string) {
    super(message, code, 500);
    this.name = "GenerationError";
  }
}

export class GroqAPIError extends GenerationError {
  constructor(details?: string) {
    super(
      `Error al generar el contenido.${details ? ` ${details}` : ""} Por favor, inténtalo de nuevo.`,
      "GROQ_API_ERROR"
    );
  }
}

export class GroqRateLimitError extends GenerationError {
  constructor() {
    super(
      "El servicio está temporalmente sobrecargado. Por favor, espera unos segundos e inténtalo de nuevo.",
      "GROQ_RATE_LIMIT"
    );
  }
}

// Not found errors
export class NotFoundError extends DistribuiaError {
  constructor(resource: string) {
    super(
      `No se encontró el recurso: ${resource}`,
      "NOT_FOUND",
      404
    );
    this.name = "NotFoundError";
  }
}

// Validation errors
export class ValidationError extends DistribuiaError {
  public readonly details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// Input Processing errors (generic wrapper)
export class InputProcessingError extends DistribuiaError {
  constructor(message: string, code: string = "INPUT_PROCESSING_ERROR") {
    super(message, code, 400);
    this.name = "InputProcessingError";
  }
}

// Rate Limit errors
export class RateLimitError extends DistribuiaError {
  public readonly retryAfter?: number;

  constructor(message?: string, retryAfter?: number) {
    super(
      message || "Has realizado demasiadas peticiones. Por favor, espera unos segundos.",
      "RATE_LIMIT_EXCEEDED",
      429
    );
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        retryAfter: this.retryAfter,
      },
    };
  }
}

// Plan Limit errors (generic wrapper for plan-related limits)
export class PlanLimitError extends DistribuiaError {
  public readonly currentPlan: string;
  public readonly limitType: "conversions" | "regenerates" | "features";

  constructor(
    message: string,
    currentPlan: string,
    limitType: "conversions" | "regenerates" | "features" = "conversions"
  ) {
    super(message, "PLAN_LIMIT_EXCEEDED", 403);
    this.name = "PlanLimitError";
    this.currentPlan = currentPlan;
    this.limitType = limitType;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        currentPlan: this.currentPlan,
        limitType: this.limitType,
      },
    };
  }
}

// Error code to user-friendly message mapping (Spanish)
export const ERROR_MESSAGES: Record<string, string> = {
  // YouTube errors
  YOUTUBE_INVALID_URL: "La URL de YouTube no es valida.",
  YOUTUBE_NO_CAPTIONS: "Este video no tiene subtitulos disponibles.",
  YOUTUBE_PRIVATE_VIDEO: "Este video es privado o ha sido eliminado.",
  YOUTUBE_TRANSCRIPT_ERROR: "No se pudo obtener la transcripcion del video.",

  // Article errors
  ARTICLE_INVALID_URL: "La URL del articulo no es valida.",
  ARTICLE_PAYWALL: "Este articulo esta detras de un muro de pago.",
  ARTICLE_JS_HEAVY: "Esta pagina requiere JavaScript. Copia y pega el texto directamente.",
  ARTICLE_FETCH_ERROR: "No se pudo obtener el contenido del articulo.",
  ARTICLE_PARSE_ERROR: "No se pudo extraer el contenido del articulo.",

  // Text errors
  TEXT_TOO_SHORT: "El texto es demasiado corto. Necesitas al menos 100 palabras.",
  TEXT_TOO_LONG: "El texto es demasiado largo. Maximo 50.000 caracteres.",

  // Auth errors
  UNAUTHENTICATED: "Debes iniciar sesion para continuar.",

  // Limit errors
  CONVERSION_LIMIT_EXCEEDED: "Has alcanzado tu limite mensual de conversiones.",
  REGENERATE_LIMIT_EXCEEDED: "Has alcanzado el limite de regeneraciones para este contenido.",
  PLAN_LIMIT_EXCEEDED: "Has alcanzado el limite de tu plan actual.",
  RATE_LIMIT_EXCEEDED: "Demasiadas peticiones. Espera unos segundos.",

  // Generation errors
  GROQ_API_ERROR: "Error al generar el contenido. Intentalo de nuevo.",
  GROQ_RATE_LIMIT: "El servicio esta sobrecargado. Intentalo en unos segundos.",

  // Generic errors
  INTERNAL_ERROR: "Ha ocurrido un error inesperado. Intentalo de nuevo.",
  VALIDATION_ERROR: "Los datos introducidos no son validos.",
  NOT_FOUND: "No se encontro el recurso solicitado.",
};

// Helper to get user-friendly message from error code
export function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES.INTERNAL_ERROR;
}
