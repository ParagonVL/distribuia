import Groq from "groq-sdk";

// Model configuration
export const GROQ_MODEL = "llama-3.1-70b-versatile";

// Default parameters
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4096;

// Lazy-load Groq client to avoid issues during build time
let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY environment variable is not set. Please add it to your .env.local file."
      );
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// For backward compatibility - but prefer using getGroqClient()
export const groq = {
  get chat() {
    return getGroqClient().chat;
  },
};
