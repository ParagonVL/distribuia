import { YoutubeTranscript } from "youtube-transcript";
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

// Regex patterns for different YouTube URL formats
const YOUTUBE_URL_PATTERNS = [
  // Standard watch URLs
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  // Short URLs
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  // Embed URLs
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  // YouTube Shorts
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  // Mobile URLs
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  // YouTube Music
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

  // Check if the input is already a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  throw new YouTubeInvalidURLError();
}

/**
 * Fetch video metadata using oEmbed API (no API key required)
 */
async function fetchVideoMetadata(videoId: string): Promise<{ title: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new YouTubePrivateVideoError();
      }
      throw new YouTubeTranscriptError("No se pudo obtener información del vídeo.");
    }

    const data = await response.json();
    return { title: data.title || "Sin título" };
  } catch (error) {
    if (error instanceof YouTubePrivateVideoError) {
      throw error;
    }
    // Return default if metadata fetch fails
    return { title: "Sin título" };
  }
}

/**
 * Extract transcript from a YouTube video
 */
export async function extractYouTubeTranscript(url: string): Promise<YouTubeResult> {
  // Extract and validate video ID
  const videoId = extractVideoId(url);

  try {
    // Fetch transcript - prefer Spanish, fallback to any available
    let transcriptItems;

    try {
      // Try Spanish first
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "es",
      });
    } catch {
      // Fallback to any available language
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      } catch (fallbackError) {
        // Check error type to provide specific feedback
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : "";

        if (
          errorMessage.includes("disabled") ||
          errorMessage.includes("Transcript is disabled")
        ) {
          throw new YouTubeNoCaptionsError();
        }

        if (
          errorMessage.includes("private") ||
          errorMessage.includes("unavailable") ||
          errorMessage.includes("Video unavailable")
        ) {
          throw new YouTubePrivateVideoError();
        }

        throw new YouTubeTranscriptError();
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new YouTubeNoCaptionsError();
    }

    // Combine transcript segments into full text
    const transcript = transcriptItems
      .map((item) => item.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    // Calculate total duration from transcript items
    const lastItem = transcriptItems[transcriptItems.length - 1];
    const duration = Math.ceil(lastItem.offset / 1000 + (lastItem.duration || 0) / 1000);

    // Fetch video metadata
    const metadata = await fetchVideoMetadata(videoId);

    return {
      title: metadata.title,
      transcript,
      duration,
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

    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    throw new YouTubeTranscriptError(errorMessage);
  }
}
