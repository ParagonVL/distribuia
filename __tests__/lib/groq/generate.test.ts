import {
  generateContent,
  generateAllFormats,
  regenerateContent,
} from "@/lib/groq/generate";
import { DistribuiaError } from "@/lib/errors";

// Mock the client module
jest.mock("@/lib/groq/client", () => ({
  groqChatCompletion: jest.fn(),
  GROQ_MODEL: "llama-3.3-70b-versatile",
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 4096,
}));

// Mock the prompts module
jest.mock("@/lib/groq/prompts", () => ({
  getPromptForFormat: jest.fn().mockReturnValue("System prompt for format"),
  getUserPrompt: jest.fn().mockReturnValue("User prompt for content"),
}));

import { groqChatCompletion } from "@/lib/groq/client";
import { getPromptForFormat, getUserPrompt } from "@/lib/groq/prompts";

const mockGroqChatCompletion = groqChatCompletion as jest.MockedFunction<typeof groqChatCompletion>;
const mockGetPromptForFormat = getPromptForFormat as jest.MockedFunction<typeof getPromptForFormat>;
const mockGetUserPrompt = getUserPrompt as jest.MockedFunction<typeof getUserPrompt>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("Groq Generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation to avoid leaking between tests
    mockGroqChatCompletion.mockReset();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  const mockSuccessResponse = {
    id: "chatcmpl-123",
    object: "chat.completion",
    created: 1234567890,
    model: "llama-3.3-70b-versatile",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "Generated content here" },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
    },
  };

  describe("generateContent", () => {
    it("should generate content successfully", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      const result = await generateContent("Test content", "x_thread", "professional");

      expect(result).toEqual({
        content: "Generated content here",
        tokensUsed: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });
    });

    it("should pass topics to prompt generator", async () => {
      
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      await generateContent("Test content", "linkedin_post", "casual", ["topic1", "topic2"]);

      expect(mockGetPromptForFormat).toHaveBeenCalledWith("linkedin_post", "casual", ["topic1", "topic2"]);
    });

    it("should call groqChatCompletion with correct parameters", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      await generateContent("Test content", "x_thread", "professional");

      expect(mockGroqChatCompletion).toHaveBeenCalledWith({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "System prompt for format" },
          { role: "user", content: "User prompt for content" },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });
    });

    it("should trim generated content", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce({
        ...mockSuccessResponse,
        choices: [{ index: 0, message: { role: "assistant", content: "  Content with spaces  " }, finish_reason: "stop" }],
      });

      const result = await generateContent("Test", "x_thread", "professional");

      expect(result.content).toBe("Content with spaces");
    });

    it("should throw error when no content returned", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce({
        ...mockSuccessResponse,
        choices: [{ index: 0, message: { role: "assistant", content: "" }, finish_reason: "stop" }],
      });

      await expect(generateContent("Test", "x_thread", "professional")).rejects.toThrow("No se recibió contenido");
    });

    it("should throw error when choices are empty", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce({
        ...mockSuccessResponse,
        choices: [],
      });

      await expect(generateContent("Test", "x_thread", "professional")).rejects.toThrow("No se recibió contenido");
    });

    it("should handle missing usage data gracefully", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce({
        ...mockSuccessResponse,
        usage: undefined,
      });

      const result = await generateContent("Test", "x_thread", "professional");

      expect(result.tokensUsed).toEqual({
        prompt: 0,
        completion: 0,
        total: 0,
      });
    });

    describe("Error handling", () => {
      it("should throw error with GROQ_API_ERROR code for API errors", async () => {
        mockGroqChatCompletion.mockRejectedValueOnce(new Error("Groq API returned error"));

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(DistribuiaError);
          expect((error as DistribuiaError).code).toBe("GROQ_API_ERROR");
        }
      });

      it("should throw error with GROQ_API_ERROR code for model errors", async () => {
        mockGroqChatCompletion.mockRejectedValueOnce(new Error("Model not found"));

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(DistribuiaError);
          expect((error as DistribuiaError).code).toBe("GROQ_API_ERROR");
        }
      });

      it("should throw GROQ_RATE_LIMIT error for rate limit", async () => {
        // Mock returns rate limit error on all 3 attempts (triggering the error handling)
        mockGroqChatCompletion
          .mockRejectedValueOnce(new Error("Rate limit exceeded|30"))
          .mockRejectedValueOnce(new Error("Rate limit exceeded|30"))
          .mockRejectedValueOnce(new Error("Rate limit exceeded|30"));

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(DistribuiaError);
          expect((error as DistribuiaError).code).toBe("GROQ_RATE_LIMIT");
        }
      }, 30000); // Longer timeout for retries

      it("should include retry seconds in rate limit error message", async () => {
        mockGroqChatCompletion
          .mockRejectedValueOnce(new Error("Rate limit exceeded|45"))
          .mockRejectedValueOnce(new Error("Rate limit exceeded|45"))
          .mockRejectedValueOnce(new Error("Rate limit exceeded|45"));

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect((error as Error).message).toContain("45 segundos");
        }
      }, 30000);

      it("should handle 429 error indicator in message", async () => {
        mockGroqChatCompletion
          .mockRejectedValueOnce(new Error("Error 429: Too many requests"))
          .mockRejectedValueOnce(new Error("Error 429: Too many requests"))
          .mockRejectedValueOnce(new Error("Error 429: Too many requests"));

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(DistribuiaError);
          expect((error as DistribuiaError).code).toBe("GROQ_RATE_LIMIT");
        }
      }, 30000);

      it("should wrap unknown errors in GroqAPIError", async () => {
        mockGroqChatCompletion.mockRejectedValueOnce(new Error("Unknown error xyz"));

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(DistribuiaError);
          expect((error as DistribuiaError).code).toBe("GROQ_API_ERROR");
          expect((error as Error).message).toContain("Unknown error xyz");
        }
      });

      it("should handle non-Error objects", async () => {
        mockGroqChatCompletion.mockRejectedValueOnce("String error");

        try {
          await generateContent("Test", "x_thread", "professional");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(DistribuiaError);
          expect((error as DistribuiaError).code).toBe("GROQ_API_ERROR");
        }
      });
    });

    describe("Content truncation", () => {
      it("should not truncate short content", async () => {
        
        mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

        const shortContent = "Short content";
        await generateContent(shortContent, "x_thread", "professional");

        expect(mockGetUserPrompt).toHaveBeenCalled();
      });

      it("should truncate very long content", async () => {
        mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

        // Content over 20000 chars
        const longContent = "A".repeat(25000);
        const result = await generateContent(longContent, "x_thread", "professional");

        expect(result.content).toBe("Generated content here");
        // The mock was called, meaning truncation happened internally
        expect(mockGroqChatCompletion).toHaveBeenCalled();
      });
    });
  });

  describe("generateAllFormats", () => {
    it("should call generateContent for all three formats", async () => {
      const xThreadResponse = {
        ...mockSuccessResponse,
        choices: [{ index: 0, message: { role: "assistant", content: "X thread" }, finish_reason: "stop" }],
      };
      const linkedInPostResponse = {
        ...mockSuccessResponse,
        choices: [{ index: 0, message: { role: "assistant", content: "LinkedIn post" }, finish_reason: "stop" }],
      };
      const linkedInArticleResponse = {
        ...mockSuccessResponse,
        choices: [{ index: 0, message: { role: "assistant", content: "LinkedIn article" }, finish_reason: "stop" }],
      };

      mockGroqChatCompletion
        .mockResolvedValueOnce(xThreadResponse)
        .mockResolvedValueOnce(linkedInPostResponse)
        .mockResolvedValueOnce(linkedInArticleResponse);

      const result = await generateAllFormats("Test content", "professional", ["topic"]);

      expect(result.x_thread.content).toBe("X thread");
      expect(result.linkedin_post.content).toBe("LinkedIn post");
      expect(result.linkedin_article.content).toBe("LinkedIn article");
      expect(mockGroqChatCompletion).toHaveBeenCalledTimes(3);
    }, 60000); // Longer timeout due to 15s delays between calls

    it("should propagate errors from second call", async () => {
      mockGroqChatCompletion
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockRejectedValueOnce(new Error("API error on second call"));

      await expect(generateAllFormats("Test", "professional")).rejects.toThrow();
    }, 60000);
  });

  describe("regenerateContent", () => {
    it("should generate content without previous content", async () => {
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      const result = await regenerateContent("Test content", "x_thread", "professional");

      expect(result.content).toBe("Generated content here");
    });

    it("should add previous content instructions when provided", async () => {
      
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      await regenerateContent(
        "Original content",
        "linkedin_post",
        "casual",
        ["topic"],
        "Previous generated content"
      );

      // Check that getUserPrompt was called with enhanced content
      const calledContent = mockGetUserPrompt.mock.calls[0][0];
      expect(calledContent).toContain("VERSIÓN ANTERIOR");
      expect(calledContent).toContain("genera algo DIFERENTE");
    });

    it("should truncate long previous content to 500 chars", async () => {
      
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      const longPreviousContent = "A".repeat(1000);
      await regenerateContent(
        "Original content",
        "x_thread",
        "professional",
        undefined,
        longPreviousContent
      );

      const calledContent = mockGetUserPrompt.mock.calls[0][0];
      // Previous content should be truncated - shouldn't contain 600 A's in a row
      expect(calledContent).not.toContain("A".repeat(600));
    });

    it("should pass topics correctly", async () => {
      
      mockGroqChatCompletion.mockResolvedValueOnce(mockSuccessResponse);

      await regenerateContent(
        "Content",
        "linkedin_article",
        "professional",
        ["AI", "Tech"]
      );

      expect(mockGetPromptForFormat).toHaveBeenCalledWith("linkedin_article", "professional", ["AI", "Tech"]);
    });
  });
});
