import { TextTooShortError, TextTooLongError } from "@/lib/errors";

export interface TextResult {
  content: string;
  wordCount: number;
  characterCount: number;
}

const MIN_WORDS = 100;
const MAX_CHARACTERS = 50000;

/**
 * Clean and normalize input text
 */
function cleanText(text: string): string {
  return (
    text
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Remove excessive whitespace
      .replace(/[ \t]+/g, " ")
      // Remove excessive line breaks (more than 2)
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace from each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Final trim
      .trim()
  );
}

/**
 * Count words in text (handles Spanish correctly)
 */
function countWords(text: string): number {
  // Split by whitespace and filter empty strings
  const words = text.split(/\s+/).filter((word) => {
    // Only count actual words (at least one letter, including Spanish characters)
    return word.length > 0 && /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(word);
  });

  return words.length;
}

/**
 * Process and validate raw text input
 */
export function processRawText(text: string): TextResult {
  // Clean the text first
  const cleanedText = cleanText(text);

  // Count characters
  const characterCount = cleanedText.length;

  // Check maximum length first (before spending time counting words)
  if (characterCount > MAX_CHARACTERS) {
    throw new TextTooLongError(characterCount);
  }

  // Count words
  const wordCount = countWords(cleanedText);

  // Check minimum word count
  if (wordCount < MIN_WORDS) {
    throw new TextTooShortError(wordCount);
  }

  return {
    content: cleanedText,
    wordCount,
    characterCount,
  };
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words per minute for Spanish
  const WPM = 200;
  return Math.ceil(wordCount / WPM);
}

/**
 * Extract potential topics from text using simple keyword extraction
 */
export function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  // Common Spanish stop words to ignore
  const stopWords = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas",
    "de", "del", "al", "a", "en", "con", "por", "para", "sin",
    "sobre", "entre", "hacia", "desde", "hasta", "durante",
    "que", "cual", "quien", "cuyo", "donde", "cuando", "como",
    "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas",
    "aquel", "aquella", "aquellos", "aquellas",
    "mi", "tu", "su", "nuestro", "vuestro", "mis", "tus", "sus",
    "yo", "tú", "él", "ella", "nosotros", "vosotros", "ellos", "ellas",
    "me", "te", "se", "nos", "os", "le", "les", "lo", "la",
    "ser", "estar", "haber", "tener", "hacer", "poder", "decir",
    "ir", "ver", "dar", "saber", "querer", "llegar", "pasar",
    "es", "son", "está", "están", "fue", "fueron", "era", "eran",
    "ha", "han", "hay", "había", "hubo", "sido", "siendo",
    "tiene", "tienen", "tenía", "tenían", "tuvo", "tuvieron",
    "muy", "más", "menos", "tan", "tanto", "mucho", "poco",
    "ya", "aún", "todavía", "siempre", "nunca", "jamás",
    "sí", "no", "también", "tampoco", "además", "incluso",
    "pero", "sino", "aunque", "porque", "pues", "entonces",
    "así", "ahora", "aquí", "allí", "bien", "mal",
    "todo", "toda", "todos", "todas", "algo", "nada", "alguien", "nadie",
    "otro", "otra", "otros", "otras", "mismo", "misma",
    "cada", "cualquier", "cualquiera", "alguno", "ninguno",
  ]);

  // Extract words (only alphabetic characters)
  const words = text
    .toLowerCase()
    .match(/\b[a-záéíóúüñ]{4,}\b/gi) || [];

  // Count word frequency
  const wordFreq = new Map<string, number>();
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (!stopWords.has(lowerWord)) {
      wordFreq.set(lowerWord, (wordFreq.get(lowerWord) || 0) + 1);
    }
  }

  // Sort by frequency and return top keywords
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}
