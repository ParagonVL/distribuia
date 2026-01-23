import {
  convertRequestSchema,
  regenerateRequestSchema,
  formatZodErrors,
} from "@/lib/validations";
import { z } from "zod";

describe("convertRequestSchema", () => {
  it("should accept valid YouTube request", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "youtube",
      inputValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      tone: "profesional",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid article request", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "article",
      inputValue: "https://example.com/article",
      tone: "cercano",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid text request with minimum length", () => {
    const longText = "palabra ".repeat(100); // 100 words
    const result = convertRequestSchema.safeParse({
      inputType: "text",
      inputValue: longText,
      tone: "tecnico",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty inputValue", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "youtube",
      inputValue: "",
      tone: "profesional",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid inputType", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "invalid",
      inputValue: "https://example.com",
      tone: "profesional",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid tone", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "youtube",
      inputValue: "https://www.youtube.com/watch?v=test",
      tone: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional topics array", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "youtube",
      inputValue: "https://www.youtube.com/watch?v=test",
      tone: "profesional",
      topics: ["AI", "Tech"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topics).toEqual(["AI", "Tech"]);
    }
  });

  it("should reject more than 5 topics", () => {
    const result = convertRequestSchema.safeParse({
      inputType: "youtube",
      inputValue: "https://www.youtube.com/watch?v=test",
      tone: "profesional",
      topics: ["1", "2", "3", "4", "5", "6"],
    });
    expect(result.success).toBe(false);
  });
});

describe("regenerateRequestSchema", () => {
  it("should accept valid regenerate request", () => {
    const result = regenerateRequestSchema.safeParse({
      outputId: "550e8400-e29b-41d4-a716-446655440000",
      format: "x_thread",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const result = regenerateRequestSchema.safeParse({
      outputId: "invalid-uuid",
      format: "x_thread",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid format", () => {
    const result = regenerateRequestSchema.safeParse({
      outputId: "550e8400-e29b-41d4-a716-446655440000",
      format: "invalid_format",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid formats", () => {
    const formats = ["x_thread", "linkedin_post", "linkedin_article"];
    formats.forEach((format) => {
      const result = regenerateRequestSchema.safeParse({
        outputId: "550e8400-e29b-41d4-a716-446655440000",
        format,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("formatZodErrors", () => {
  it("should format Zod errors to Spanish messages", () => {
    const schema = z.object({
      email: z.string().email(),
    });
    const result = schema.safeParse({ email: "invalid" });

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted).toHaveProperty("email");
      expect(Array.isArray(formatted.email)).toBe(true);
    }
  });
});
