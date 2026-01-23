import {
  YouTubeInvalidURLError,
  YouTubeNoCaptionsError,
  YouTubePrivateVideoError,
  YouTubeTranscriptError,
} from "@/lib/errors";

export interface YouTubeResult {
  title: string;
  transcript: string;
  duration: number;
  videoId: string;
}

interface SupadataTranscriptResponse {
  content: Array<{
    text: string;
    offset: number;
    duration: number;
  }>;
  lang: string;
  availableLangs?: string[];
}

// Regex patterns for different YouTube URL formats
const YOUTUBE_URL_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
];

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string {
  const trimmedUrl = url.trim();

  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  throw new YouTubeInvalidURLError();
}

/**
 * Fetch video metadata using oEmbed API
 */
async function fetchVideoMetadata(videoId: string): Promise<{ title: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new YouTubePrivateVideoError();
      }
      return { title: "Sin título" };
    }

    const data = await response.json();
    return { title: data.title || "Sin título" };
  } catch (error) {
    if (error instanceof YouTubePrivateVideoError) {
      throw error;
    }
    return { title: "Sin título" };
  }
}

/**
 * Fetch transcript using Supadata API
 */
async function fetchTranscriptSupadata(videoId: string): Promise<{
  transcript: string;
  duration: number;
  lang: string;
}> {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    console.error("[YouTube] SUPADATA_API_KEY not configured");
    throw new YouTubeTranscriptError("Servicio de transcripción no configurado");
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const apiUrl = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(youtubeUrl)}&lang=es&mode=native`;

  console.log("[YouTube] Fetching transcript via Supadata for:", videoId);

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  console.log("[YouTube] Supadata response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[YouTube] Supadata error:", errorText);

    if (response.status === 404) {
      throw new YouTubeNoCaptionsError();
    }
    if (response.status === 401 || response.status === 403) {
      throw new YouTubeTranscriptError("Error de autenticación con el servicio de transcripción");
    }
    if (response.status === 400) {
      // Check if it's a "no captions" error
      if (errorText.includes("transcript") || errorText.includes("caption")) {
        throw new YouTubeNoCaptionsError();
      }
      throw new YouTubePrivateVideoError();
    }
    throw new YouTubeTranscriptError(`Error del servicio: ${response.status}`);
  }

  const data: SupadataTranscriptResponse = await response.json();
  console.log("[YouTube] Supadata returned", data.content?.length || 0, "segments in", data.lang);

  if (!data.content || data.content.length === 0) {
    throw new YouTubeNoCaptionsError();
  }

  // Combine all transcript segments
  const transcript = data.content
    .map((segment) => segment.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // Calculate duration from last segment
  const lastSegment = data.content[data.content.length - 1];
  const duration = Math.ceil((lastSegment.offset + lastSegment.duration) / 1000);

  console.log("[YouTube] Transcript extracted:", transcript.length, "chars,", duration, "seconds");

  return {
    transcript,
    duration,
    lang: data.lang,
  };
}

/**
 * Extract transcript from a YouTube video
 */
export async function extractYouTubeTranscript(url: string): Promise<YouTubeResult> {
  const videoId = extractVideoId(url);
  console.log("[YouTube] Extracting transcript for video:", videoId);

  try {
    // Fetch transcript and metadata in parallel
    const [transcriptResult, metadata] = await Promise.all([
      fetchTranscriptSupadata(videoId),
      fetchVideoMetadata(videoId),
    ]);

    return {
      title: metadata.title,
      transcript: transcriptResult.transcript,
      duration: transcriptResult.duration,
      videoId,
    };
  } catch (error) {
    // Re-throw our custom errors
    if (
      error instanceof YouTubeInvalidURLError ||
      error instanceof YouTubeNoCaptionsError ||
      error instanceof YouTubePrivateVideoError ||
      error instanceof YouTubeTranscriptError
    ) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("[YouTube] Unexpected error:", errorMessage);
    throw new YouTubeTranscriptError(errorMessage);
  }
}
