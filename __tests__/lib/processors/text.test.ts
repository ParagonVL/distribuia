import {
  processRawText,
  estimateReadingTime,
  extractKeywords,
} from "@/lib/processors/text";

describe("processRawText", () => {
  const generateText = (wordCount: number): string => {
    return Array(wordCount).fill("palabra").join(" ");
  };

  it("should process valid text with enough words", () => {
    const text = generateText(100);
    const result = processRawText(text);

    expect(result.wordCount).toBe(100);
    expect(result.content).toContain("palabra");
    expect(result.characterCount).toBeGreaterThan(0);
  });

  it("should throw error for text with less than 100 words", () => {
    const text = generateText(50);

    expect(() => processRawText(text)).toThrow("demasiado corto");
  });

  it("should throw error for text over 50000 characters", () => {
    // Create text that exceeds 50000 characters
    const text = "a".repeat(50001);

    expect(() => processRawText(text)).toThrow("demasiado largo");
  });

  it("should normalize line endings", () => {
    const text = generateText(100) + "\r\ntest\rmore";
    const result = processRawText(text);

    expect(result.content).not.toContain("\r");
  });

  it("should remove excessive whitespace", () => {
    const text = generateText(100) + "  multiple   spaces  ";
    const result = processRawText(text);

    expect(result.content).not.toContain("  ");
  });

  it("should handle Spanish characters in word count", () => {
    const spanishText =
      "Esta es una oracin con acentos como ste n y otros caracteres especiales que debera contar correctamente las palabras en espaol incluyendo palabras como maana ayer hoy y otras " +
      generateText(90);
    const result = processRawText(spanishText);

    expect(result.wordCount).toBeGreaterThanOrEqual(100);
  });

  it("should trim the text", () => {
    const text = "   " + generateText(100) + "   ";
    const result = processRawText(text);

    expect(result.content).not.toMatch(/^\s/);
    expect(result.content).not.toMatch(/\s$/);
  });

  it("should collapse multiple line breaks", () => {
    const text = generateText(50) + "\n\n\n\n\n" + generateText(50);
    const result = processRawText(text);

    expect(result.content).not.toContain("\n\n\n");
  });
});

describe("estimateReadingTime", () => {
  it("should return 1 minute for less than 200 words", () => {
    expect(estimateReadingTime(100)).toBe(1);
    expect(estimateReadingTime(150)).toBe(1);
  });

  it("should return 1 minute for exactly 200 words", () => {
    expect(estimateReadingTime(200)).toBe(1);
  });

  it("should return 2 minutes for 201-400 words", () => {
    expect(estimateReadingTime(201)).toBe(2);
    expect(estimateReadingTime(400)).toBe(2);
  });

  it("should round up for partial minutes", () => {
    expect(estimateReadingTime(250)).toBe(2);
    expect(estimateReadingTime(450)).toBe(3);
  });

  it("should handle large word counts", () => {
    expect(estimateReadingTime(2000)).toBe(10);
    expect(estimateReadingTime(10000)).toBe(50);
  });

  it("should return 0 for 0 words", () => {
    expect(estimateReadingTime(0)).toBe(0);
  });
});

describe("extractKeywords", () => {
  it("should extract keywords from text", () => {
    const text =
      "La inteligencia artificial es una tecnologa revolucionaria. La inteligencia artificial cambia el mundo. Inteligencia artificial en el futuro.";
    const keywords = extractKeywords(text, 3);

    expect(keywords).toContain("inteligencia");
    expect(keywords).toContain("artificial");
    expect(keywords.length).toBeLessThanOrEqual(3);
  });

  it("should ignore Spanish stop words", () => {
    const text = "El la los las un una que como para por sobre entre";
    const keywords = extractKeywords(text, 5);

    expect(keywords.length).toBe(0);
  });

  it("should respect maxKeywords limit", () => {
    const text =
      "tecnologa innovacin desarrollo software programacin cdigo aplicacin sistema datos informacin";
    const keywords = extractKeywords(text, 3);

    expect(keywords.length).toBeLessThanOrEqual(3);
  });

  it("should return empty array for empty text", () => {
    expect(extractKeywords("", 5)).toEqual([]);
  });

  it("should return lowercase keywords", () => {
    const text = "TECNOLOGA Tecnologa tecnologa INNOVACIN";
    const keywords = extractKeywords(text, 2);

    keywords.forEach((keyword) => {
      expect(keyword).toBe(keyword.toLowerCase());
    });
  });

  it("should use default maxKeywords of 5", () => {
    const text =
      "uno dos tres cuatro cinco seis siete ocho nueve diez " +
      "uno dos tres cuatro cinco seis siete ocho nueve diez";
    const keywords = extractKeywords(text);

    expect(keywords.length).toBeLessThanOrEqual(5);
  });

  it("should only count words with at least 4 characters", () => {
    const text = "el la de en un una sol mar voz paz amor vida";
    const keywords = extractKeywords(text, 10);

    // "amor" and "vida" should be counted (4+ chars)
    keywords.forEach((keyword) => {
      expect(keyword.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("should sort by frequency", () => {
    const text =
      "tecnologa tecnologa tecnologa innovacin innovacin desarrollo";
    const keywords = extractKeywords(text, 3);

    expect(keywords[0]).toBe("tecnologa");
    expect(keywords[1]).toBe("innovacin");
  });
});
