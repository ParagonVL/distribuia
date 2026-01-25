import { groqChatCompletion, GROQ_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS, groq } from "@/lib/groq/client";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("Groq Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GROQ_API_KEY: "test-api-key-123" };
  });

  afterAll(() => {
    process.env = originalEnv;
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("Constants", () => {
    it("should export correct model name", () => {
      expect(GROQ_MODEL).toBe("llama-3.3-70b-versatile");
    });

    it("should export correct default temperature", () => {
      expect(DEFAULT_TEMPERATURE).toBe(0.7);
    });

    it("should export correct default max tokens", () => {
      expect(DEFAULT_MAX_TOKENS).toBe(4096);
    });
  });

  describe("groqChatCompletion", () => {
    const mockRequest = {
      model: GROQ_MODEL,
      messages: [
        { role: "system" as const, content: "You are a helpful assistant" },
        { role: "user" as const, content: "Hello" },
      ],
    };

    const mockSuccessResponse = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1234567890,
      model: GROQ_MODEL,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "Hello! How can I help?" },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
      },
    };

    it("should throw error when GROQ_API_KEY is not set", async () => {
      delete process.env.GROQ_API_KEY;

      await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
        "GROQ_API_KEY environment variable is not set"
      );
    });

    it("should make successful API call", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      const result = await groqChatCompletion(mockRequest);

      expect(result).toEqual(mockSuccessResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.groq.com/openai/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-api-key-123",
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should use default temperature and max_tokens when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      await groqChatCompletion(mockRequest);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.temperature).toBe(DEFAULT_TEMPERATURE);
      expect(callBody.max_tokens).toBe(DEFAULT_MAX_TOKENS);
    });

    it("should use provided temperature and max_tokens", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      await groqChatCompletion({
        ...mockRequest,
        temperature: 0.5,
        max_tokens: 2048,
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.temperature).toBe(0.5);
      expect(callBody.max_tokens).toBe(2048);
    });

    it("should clean whitespace from API key", async () => {
      process.env.GROQ_API_KEY = "  test-key-with-spaces  \n";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      await groqChatCompletion(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-key-with-spaces",
          }),
        })
      );
    });

    describe("Error handling", () => {
      it("should throw rate limit error with retry time", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => "Rate limit exceeded. Please try again in 28.67s",
        });

        await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
          "Rate limit exceeded|29"
        );
      });

      it("should use default retry time when not parseable", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => "Too many requests",
        });

        await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
          "Rate limit exceeded|30"
        );
      });

      it("should throw invalid API key error on 401", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          text: async () => "Unauthorized",
        });

        await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
          "Invalid API key"
        );
      });

      it("should throw service unavailable error on 503", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: async () => "Service Unavailable",
        });

        await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
          "Service temporarily unavailable"
        );
      });

      it("should throw service unavailable error on 502", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 502,
          text: async () => "Bad Gateway",
        });

        await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
          "Service temporarily unavailable"
        );
      });

      it("should throw generic API error for other status codes", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "Internal Server Error",
        });

        await expect(groqChatCompletion(mockRequest)).rejects.toThrow(
          "Groq API error: 500 - Internal Server Error"
        );
      });
    });
  });

  describe("groq backward compatibility object", () => {
    it("should expose chat.completions.create method", () => {
      expect(groq.chat.completions.create).toBe(groqChatCompletion);
    });
  });
});
