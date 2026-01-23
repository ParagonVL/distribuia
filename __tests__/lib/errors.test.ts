import {
  DistribuiaError,
  ValidationError,
  UnauthenticatedError,
  ConversionLimitExceededError,
  RegenerateLimitExceededError,
  NotFoundError,
  YouTubeError,
  ArticleError,
  GroqAPIError,
} from "@/lib/errors";

describe("DistribuiaError", () => {
  it("should create error with code and message", () => {
    const error = new DistribuiaError("Test error", "TEST_ERROR", 400);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.statusCode).toBe(400);
  });

  it("should serialize to JSON correctly", () => {
    const error = new DistribuiaError("Test error", "TEST_ERROR", 400);
    const json = error.toJSON();
    expect(json).toEqual({
      error: {
        code: "TEST_ERROR",
        message: "Test error",
      },
    });
  });
});

describe("ValidationError", () => {
  it("should include validation details", () => {
    const error = new ValidationError("Invalid input", {
      email: ["Email is required"],
    });
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({
      email: ["Email is required"],
    });
  });

  it("should have correct message", () => {
    const error = new ValidationError("Invalid input", {});
    expect(error.message).toBe("Invalid input");
  });
});

describe("UnauthenticatedError", () => {
  it("should have correct status code", () => {
    const error = new UnauthenticatedError();
    expect(error.code).toBe("UNAUTHENTICATED");
    expect(error.statusCode).toBe(401);
  });
});

describe("ConversionLimitExceededError", () => {
  it("should include limit and plan info", () => {
    const error = new ConversionLimitExceededError(10, "Pro");
    expect(error.code).toBe("CONVERSION_LIMIT_EXCEEDED");
    expect(error.statusCode).toBe(403);
    expect(error.message).toContain("10");
    expect(error.message).toContain("Pro");
  });
});

describe("RegenerateLimitExceededError", () => {
  it("should include limit info", () => {
    const error = new RegenerateLimitExceededError(3);
    expect(error.code).toBe("REGENERATE_LIMIT_EXCEEDED");
    expect(error.statusCode).toBe(403);
    expect(error.message).toContain("3");
  });
});

describe("NotFoundError", () => {
  it("should include resource type", () => {
    const error = new NotFoundError("conversion");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.message).toContain("conversion");
  });
});

describe("YouTubeError", () => {
  it("should create error with specific YouTube code", () => {
    const error = new YouTubeError(
      "Video not found",
      "YOUTUBE_VIDEO_NOT_FOUND"
    );
    expect(error.code).toBe("YOUTUBE_VIDEO_NOT_FOUND");
    expect(error.statusCode).toBe(400);
  });
});

describe("ArticleError", () => {
  it("should create error with specific Article code", () => {
    const error = new ArticleError("Article behind paywall", "ARTICLE_PAYWALL");
    expect(error.code).toBe("ARTICLE_PAYWALL");
    expect(error.statusCode).toBe(400);
  });
});

describe("GroqAPIError", () => {
  it("should create error with default code", () => {
    const error = new GroqAPIError();
    expect(error.code).toBe("GROQ_API_ERROR");
    expect(error.statusCode).toBe(500);
  });

  it("should include details in message if provided", () => {
    const error = new GroqAPIError("Connection timeout");
    expect(error.message).toContain("Connection timeout");
    expect(error.code).toBe("GROQ_API_ERROR");
  });
});
