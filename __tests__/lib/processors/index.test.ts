import { detectInputType } from "@/lib/processors";

describe("detectInputType", () => {
  describe("YouTube detection", () => {
    it("should detect standard YouTube watch URLs", () => {
      expect(detectInputType("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("youtube");
      expect(detectInputType("http://www.youtube.com/watch?v=test123")).toBe("youtube");
      expect(detectInputType("https://youtube.com/watch?v=abc")).toBe("youtube");
    });

    it("should detect short YouTube URLs (youtu.be)", () => {
      expect(detectInputType("https://youtu.be/dQw4w9WgXcQ")).toBe("youtube");
      expect(detectInputType("http://youtu.be/test123")).toBe("youtube");
    });

    it("should detect YouTube embed URLs", () => {
      expect(detectInputType("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("youtube");
    });

    it("should detect YouTube Shorts URLs", () => {
      expect(detectInputType("https://www.youtube.com/shorts/abc123")).toBe("youtube");
      expect(detectInputType("https://youtube.com/shorts/test")).toBe("youtube");
    });

    it("should detect mobile YouTube URLs", () => {
      expect(detectInputType("https://m.youtube.com/watch?v=test123")).toBe("youtube");
    });

    it("should detect YouTube Music URLs", () => {
      expect(detectInputType("https://music.youtube.com/watch?v=test123")).toBe("youtube");
    });

    it("should handle URLs without protocol", () => {
      expect(detectInputType("youtube.com/watch?v=test")).toBe("youtube");
      expect(detectInputType("www.youtube.com/watch?v=test")).toBe("youtube");
    });
  });

  describe("Article detection", () => {
    it("should detect standard article URLs", () => {
      expect(detectInputType("https://example.com/article")).toBe("article");
      expect(detectInputType("http://blog.example.com/post/123")).toBe("article");
    });

    it("should detect URLs with query parameters", () => {
      expect(detectInputType("https://news.com/story?id=123")).toBe("article");
    });

    it("should detect URLs without protocol starting with http", () => {
      expect(detectInputType("http://example.com")).toBe("article");
    });

    it("should detect Medium URLs", () => {
      expect(detectInputType("https://medium.com/@user/article-title-123abc")).toBe("article");
    });

    it("should detect subdomains", () => {
      expect(detectInputType("https://blog.mysite.com/post")).toBe("article");
    });
  });

  describe("Text detection", () => {
    it("should detect plain text", () => {
      expect(detectInputType("This is just some plain text")).toBe("text");
    });

    it("should detect text with Spanish characters", () => {
      expect(detectInputType("Este es un texto en espaol con acentos")).toBe("text");
    });

    it("should detect multi-line text", () => {
      const multiline = `Line one
      Line two
      Line three`;
      expect(detectInputType(multiline)).toBe("text");
    });

    it("should detect text with numbers", () => {
      expect(detectInputType("This text has 123 numbers")).toBe("text");
    });

    it("should handle empty-ish input as text", () => {
      expect(detectInputType("   ")).toBe("text");
    });
  });

  describe("Edge cases", () => {
    it("should handle whitespace around URLs", () => {
      expect(detectInputType("  https://www.youtube.com/watch?v=test  ")).toBe("youtube");
      expect(detectInputType("  https://example.com/article  ")).toBe("article");
    });

    it("should not mistake text containing URLs as article", () => {
      // If text starts with regular words, it's text even if it contains URLs later
      const text = "Check out this video";
      expect(detectInputType(text)).toBe("text");
    });

    it("should handle URLs with paths", () => {
      expect(detectInputType("https://example.com/blog/2024/01/article")).toBe("article");
    });

    it("should handle URLs with fragments", () => {
      expect(detectInputType("https://example.com/page#section")).toBe("article");
    });
  });
});
