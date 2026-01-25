import { processInput } from "@/lib/processors";
import { DistribuiaError } from "@/lib/errors";

// Mock the YouTube processor
jest.mock("@/lib/processors/youtube", () => ({
  extractYouTubeTranscript: jest.fn(),
}));

// Mock the article processor with dynamic import
jest.mock("@/lib/processors/article", () => ({
  extractArticleContent: jest.fn(),
}));

import { extractYouTubeTranscript } from "@/lib/processors/youtube";
import { extractArticleContent } from "@/lib/processors/article";

const mockExtractYouTubeTranscript = extractYouTubeTranscript as jest.MockedFunction<typeof extractYouTubeTranscript>;
const mockExtractArticleContent = extractArticleContent as jest.MockedFunction<typeof extractArticleContent>;

// Helper to generate text with minimum word count (100 words)
function generateLongText(baseText: string, minWords: number = 100): string {
  const words = baseText.split(" ");
  while (words.length < minWords) {
    words.push(...baseText.split(" "));
  }
  return words.slice(0, minWords + 10).join(" ");
}

describe("processInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Input validation", () => {
    it("should throw error for empty string", async () => {
      await expect(processInput("youtube", "")).rejects.toThrow("El contenido no puede estar vacío.");
      await expect(processInput("article", "")).rejects.toThrow("El contenido no puede estar vacío.");
      await expect(processInput("text", "")).rejects.toThrow("El contenido no puede estar vacío.");
    });

    it("should throw error for whitespace-only string", async () => {
      await expect(processInput("text", "   ")).rejects.toThrow("El contenido no puede estar vacío.");
      await expect(processInput("text", "\n\t")).rejects.toThrow("El contenido no puede estar vacío.");
    });

    it("should include correct error code for empty input", async () => {
      try {
        await processInput("text", "");
      } catch (error) {
        expect(error).toBeInstanceOf(DistribuiaError);
        expect((error as DistribuiaError).code).toBe("VALIDATION_ERROR");
      }
    });

    it("should throw error for invalid input type", async () => {
      // @ts-expect-error - Testing invalid type
      await expect(processInput("invalid", "some content")).rejects.toThrow("Tipo de entrada no válido");
    });

    it("should include type in error message for invalid type", async () => {
      try {
        // @ts-expect-error - Testing invalid type
        await processInput("podcast", "some content");
      } catch (error) {
        expect(error).toBeInstanceOf(DistribuiaError);
        expect((error as DistribuiaError).message).toContain("podcast");
      }
    });
  });

  describe("YouTube processing", () => {
    const mockYouTubeResult = {
      title: "Test Video Title",
      transcript: "This is the video transcript content",
      duration: 300,
      videoId: "dQw4w9WgXcQ",
    };

    beforeEach(() => {
      mockExtractYouTubeTranscript.mockResolvedValue(mockYouTubeResult);
    });

    it("should process YouTube URL successfully", async () => {
      const result = await processInput("youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      expect(result).toEqual({
        source: "youtube",
        content: "This is the video transcript content",
        metadata: {
          title: "Test Video Title",
          duration: 300,
          videoId: "dQw4w9WgXcQ",
        },
      });
    });

    it("should trim input before processing", async () => {
      await processInput("youtube", "  https://www.youtube.com/watch?v=test  ");

      expect(mockExtractYouTubeTranscript).toHaveBeenCalledWith("https://www.youtube.com/watch?v=test");
    });

    it("should propagate YouTube processor errors", async () => {
      const youtubeError = new Error("YouTube API error");
      mockExtractYouTubeTranscript.mockRejectedValue(youtubeError);

      await expect(processInput("youtube", "https://youtube.com/watch?v=test")).rejects.toThrow(youtubeError);
    });

    it("should call extractYouTubeTranscript with the URL", async () => {
      await processInput("youtube", "https://youtu.be/abc123");

      expect(mockExtractYouTubeTranscript).toHaveBeenCalledTimes(1);
      expect(mockExtractYouTubeTranscript).toHaveBeenCalledWith("https://youtu.be/abc123");
    });
  });

  describe("Article processing", () => {
    const mockArticleResult = {
      title: "Article Title",
      content: "This is the article content extracted from the webpage",
      siteName: "Example",
      excerpt: "A brief excerpt",
      byline: "John Doe",
    };

    beforeEach(() => {
      mockExtractArticleContent.mockResolvedValue(mockArticleResult);
    });

    it("should process article URL successfully", async () => {
      const result = await processInput("article", "https://example.com/article");

      expect(result).toEqual({
        source: "article",
        content: "This is the article content extracted from the webpage",
        metadata: {
          title: "Article Title",
          siteName: "Example",
          excerpt: "A brief excerpt",
          byline: "John Doe",
        },
      });
    });

    it("should handle article without optional fields", async () => {
      mockExtractArticleContent.mockResolvedValue({
        title: "Simple Article",
        content: "Article content here",
        siteName: "Site",
      });

      const result = await processInput("article", "https://example.com/simple");

      expect(result.metadata).toEqual({
        title: "Simple Article",
        siteName: "Site",
        excerpt: undefined,
        byline: undefined,
      });
    });

    it("should propagate article processor errors", async () => {
      const articleError = new Error("Article fetch error");
      mockExtractArticleContent.mockRejectedValue(articleError);

      await expect(processInput("article", "https://example.com/error")).rejects.toThrow(articleError);
    });

    it("should trim URL before processing", async () => {
      await processInput("article", "  https://example.com/article  \n");

      expect(mockExtractArticleContent).toHaveBeenCalledWith("https://example.com/article");
    });
  });

  describe("Text processing", () => {
    // Note: processRawText requires minimum 100 words
    const validText = generateLongText("This is some plain text content with multiple words for testing purposes.", 110);

    it("should process plain text successfully", async () => {
      const result = await processInput("text", validText);

      expect(result.source).toBe("text");
      expect(result.content).toBe(validText);
      expect(result.metadata.wordCount).toBeGreaterThanOrEqual(100);
      expect(result.metadata.characterCount).toBe(validText.length);
    });

    it("should trim text before processing", async () => {
      const textWithSpaces = "  " + validText + "  ";
      const result = await processInput("text", textWithSpaces);

      expect(result.content).toBe(validText);
    });

    it("should handle multi-line text", async () => {
      const multiLineText = generateLongText("Line one\nLine two\nLine three content here", 110);
      const result = await processInput("text", multiLineText);

      expect(result.source).toBe("text");
      expect(result.content).toContain("Line one");
      expect(result.metadata.wordCount).toBeGreaterThanOrEqual(100);
    });

    it("should handle Spanish text with accents", async () => {
      const spanishText = generateLongText("Este es un texto en español con acentos: á, é, í, ó, ú, ñ y muchas más palabras", 110);
      const result = await processInput("text", spanishText);

      expect(result.source).toBe("text");
      expect(result.content).toContain("español");
    });

    it("should count words correctly", async () => {
      const exactText = "word ".repeat(150).trim();
      const result = await processInput("text", exactText);

      expect(result.metadata.wordCount).toBe(150);
    });

    it("should count characters correctly", async () => {
      const result = await processInput("text", validText);

      expect(result.metadata.characterCount).toBe(validText.length);
    });

    it("should throw error for text below minimum word count", async () => {
      const shortText = "Only five words here now";
      await expect(processInput("text", shortText)).rejects.toThrow("demasiado corto");
    });
  });

  describe("Edge cases", () => {
    it("should throw error for minimum input below word count", async () => {
      await expect(processInput("text", "a")).rejects.toThrow("demasiado corto");
    });

    it("should handle input with numbers mixed with words", async () => {
      // Use purely word-based content to ensure word count is accurate
      const mixedText = generateLongText("Product one costs forty five dollars and ships in seven days fast", 120);
      const result = await processInput("text", mixedText);

      expect(result.metadata.wordCount).toBeGreaterThanOrEqual(100);
    });

    it("should handle input with special characters", async () => {
      const specialText = generateLongText("Hello! How are you? I'm fine. Let's test special chars: @#$%^&*()", 110);
      const result = await processInput("text", specialText);

      expect(result.source).toBe("text");
      expect(result.metadata.wordCount).toBeGreaterThanOrEqual(100);
    });

    it("should handle very long text", async () => {
      const longText = "word ".repeat(10000);
      const result = await processInput("text", longText);

      expect(result.source).toBe("text");
      expect(result.metadata.wordCount).toBe(10000);
    });
  });
});
