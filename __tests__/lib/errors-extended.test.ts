import {
  TextTooShortError,
  TextTooLongError,
  YouTubeInvalidURLError,
  YouTubeNoCaptionsError,
  YouTubePrivateVideoError,
  YouTubeTranscriptError,
  ArticleInvalidURLError,
  ArticlePaywallError,
  ArticleJSHeavyError,
  ArticleFetchError,
  ArticleParseError,
  GroqRateLimitError,
  RateLimitError,
  PlanLimitError,
  InputProcessingError,
  getErrorMessage,
  ERROR_MESSAGES,
} from "@/lib/errors";

describe("TextError classes", () => {
  it("TextTooShortError should include word count", () => {
    const error = new TextTooShortError(50);
    expect(error.code).toBe("TEXT_TOO_SHORT");
    expect(error.message).toContain("50");
    expect(error.message).toContain("100 palabras");
  });

  it("TextTooLongError should include char count", () => {
    const error = new TextTooLongError(60000);
    expect(error.code).toBe("TEXT_TOO_LONG");
    expect(error.message).toContain("60.000");
    expect(error.message).toContain("50.000");
  });
});

describe("YouTubeError classes", () => {
  it("YouTubeInvalidURLError should have correct code", () => {
    const error = new YouTubeInvalidURLError();
    expect(error.code).toBe("YOUTUBE_INVALID_URL");
    expect(error.statusCode).toBe(400);
  });

  it("YouTubeNoCaptionsError should have correct code", () => {
    const error = new YouTubeNoCaptionsError();
    expect(error.code).toBe("YOUTUBE_NO_CAPTIONS");
    expect(error.message).toContain("subtítulos");
  });

  it("YouTubePrivateVideoError should have correct code", () => {
    const error = new YouTubePrivateVideoError();
    expect(error.code).toBe("YOUTUBE_PRIVATE_VIDEO");
    expect(error.message).toContain("privado");
  });

  it("YouTubeTranscriptError should include details", () => {
    const error = new YouTubeTranscriptError("Connection timeout");
    expect(error.code).toBe("YOUTUBE_TRANSCRIPT_ERROR");
    expect(error.message).toContain("Connection timeout");
  });

  it("YouTubeTranscriptError should work without details", () => {
    const error = new YouTubeTranscriptError();
    expect(error.code).toBe("YOUTUBE_TRANSCRIPT_ERROR");
    expect(error.message).toContain("transcripción");
  });
});

describe("ArticleError classes", () => {
  it("ArticleInvalidURLError should have correct code", () => {
    const error = new ArticleInvalidURLError();
    expect(error.code).toBe("ARTICLE_INVALID_URL");
  });

  it("ArticlePaywallError should have correct code", () => {
    const error = new ArticlePaywallError();
    expect(error.code).toBe("ARTICLE_PAYWALL");
    expect(error.message).toContain("muro de pago");
  });

  it("ArticleJSHeavyError should have correct code", () => {
    const error = new ArticleJSHeavyError();
    expect(error.code).toBe("ARTICLE_JS_HEAVY");
    expect(error.message).toContain("JavaScript");
  });

  it("ArticleFetchError should include details", () => {
    const error = new ArticleFetchError("Network error");
    expect(error.code).toBe("ARTICLE_FETCH_ERROR");
    expect(error.message).toContain("Network error");
  });

  it("ArticleParseError should have correct code", () => {
    const error = new ArticleParseError();
    expect(error.code).toBe("ARTICLE_PARSE_ERROR");
  });
});

describe("GroqRateLimitError", () => {
  it("should have correct code", () => {
    const error = new GroqRateLimitError();
    expect(error.code).toBe("GROQ_RATE_LIMIT");
    expect(error.statusCode).toBe(500);
    expect(error.message).toContain("sobrecargado");
  });
});

describe("RateLimitError", () => {
  it("should have default message", () => {
    const error = new RateLimitError();
    expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(error.statusCode).toBe(429);
    expect(error.message).toContain("demasiadas peticiones");
  });

  it("should accept custom message and retryAfter", () => {
    const error = new RateLimitError("Custom message", 60);
    expect(error.message).toBe("Custom message");
    expect(error.retryAfter).toBe(60);
  });

  it("should store retryAfter property", () => {
    const error = new RateLimitError("Test", 30);
    expect(error.retryAfter).toBe(30);
    // Base toJSON is used - check that basic serialization works
    const json = error.toJSON();
    expect(json.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});

describe("PlanLimitError", () => {
  it("should include plan info", () => {
    const error = new PlanLimitError("Limit exceeded", "starter", "conversions");
    expect(error.code).toBe("PLAN_LIMIT_EXCEEDED");
    expect(error.statusCode).toBe(403);
    expect(error.currentPlan).toBe("starter");
    expect(error.limitType).toBe("conversions");
  });

  it("should store plan info as properties", () => {
    const error = new PlanLimitError("Test", "pro", "regenerates");
    expect(error.currentPlan).toBe("pro");
    expect(error.limitType).toBe("regenerates");
    // Base toJSON is used - check that basic serialization works
    const json = error.toJSON();
    expect(json.error.code).toBe("PLAN_LIMIT_EXCEEDED");
  });

  it("should default limitType to conversions", () => {
    const error = new PlanLimitError("Test", "free");
    expect(error.limitType).toBe("conversions");
  });
});

describe("InputProcessingError", () => {
  it("should have correct code", () => {
    const error = new InputProcessingError("Test error");
    expect(error.code).toBe("INPUT_PROCESSING_ERROR");
    expect(error.statusCode).toBe(400);
  });

  it("should accept custom code", () => {
    const error = new InputProcessingError("Test", "CUSTOM_CODE");
    expect(error.code).toBe("CUSTOM_CODE");
  });
});

describe("getErrorMessage", () => {
  it("should return message for known error code", () => {
    expect(getErrorMessage("YOUTUBE_NO_CAPTIONS")).toBe(ERROR_MESSAGES.YOUTUBE_NO_CAPTIONS);
    expect(getErrorMessage("UNAUTHENTICATED")).toBe(ERROR_MESSAGES.UNAUTHENTICATED);
  });

  it("should return fallback for unknown error code", () => {
    expect(getErrorMessage("UNKNOWN_CODE", "Custom fallback")).toBe("Custom fallback");
  });

  it("should return INTERNAL_ERROR message for unknown code without fallback", () => {
    expect(getErrorMessage("UNKNOWN_CODE")).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
  });
});

describe("ERROR_MESSAGES", () => {
  it("should contain all expected error codes", () => {
    const expectedCodes = [
      "YOUTUBE_INVALID_URL",
      "YOUTUBE_NO_CAPTIONS",
      "YOUTUBE_PRIVATE_VIDEO",
      "ARTICLE_INVALID_URL",
      "ARTICLE_PAYWALL",
      "TEXT_TOO_SHORT",
      "TEXT_TOO_LONG",
      "UNAUTHENTICATED",
      "CONVERSION_LIMIT_EXCEEDED",
      "REGENERATE_LIMIT_EXCEEDED",
      "RATE_LIMIT_EXCEEDED",
      "GROQ_API_ERROR",
      "INTERNAL_ERROR",
      "VALIDATION_ERROR",
      "NOT_FOUND",
    ];

    expectedCodes.forEach((code) => {
      expect(ERROR_MESSAGES[code]).toBeDefined();
    });
  });
});
