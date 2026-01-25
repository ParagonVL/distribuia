// Model configuration - 70B has 12K TPM, need shorter content to avoid rate limits
export const GROQ_MODEL = "llama-3.3-70b-versatile";

// Default parameters
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4096;

// Groq API endpoint
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call Groq API directly using fetch (more reliable in serverless environments)
 */
export async function groqChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const rawApiKey = process.env.GROQ_API_KEY;

  if (!rawApiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is not set. Please add it to your .env.local file."
    );
  }

  // Remove ALL whitespace/newlines that may have been added during copy/paste
  const apiKey = rawApiKey.replace(/[\s\r\n]+/g, "");

  console.log("[Groq] Making direct API call to Groq...", "key length:", apiKey.length);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: request.max_tokens ?? DEFAULT_MAX_TOKENS,
    }),
  });

  console.log("[Groq] API response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Groq] API error response:", errorText);

    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    if (response.status === 401) {
      throw new Error("Invalid API key");
    }
    if (response.status === 503 || response.status === 502) {
      throw new Error("Service temporarily unavailable");
    }

    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data;
}

// For backward compatibility with old SDK-style interface
export const groq = {
  chat: {
    completions: {
      create: groqChatCompletion,
    },
  },
};
