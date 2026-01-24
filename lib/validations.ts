import { z } from "zod";
import { sanitizeUrl, sanitizeText } from "./security";

// Input types enum
export const inputTypeSchema = z.enum(["youtube", "article", "text"]);

// Tone types enum
export const toneSchema = z.enum(["profesional", "cercano", "tecnico"]);

// Output format enum
export const outputFormatSchema = z.enum([
  "x_thread",
  "linkedin_post",
  "linkedin_article",
]);

// YouTube URL validation
const youtubeUrlSchema = z.string().refine(
  (url) => {
    const sanitized = sanitizeUrl(url);
    if (!sanitized) return false;
    // Match youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
    const ytRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?|shorts\/)|youtu\.be\/)/;
    return ytRegex.test(sanitized);
  },
  { message: "URL de YouTube no válida" }
);

// Article URL validation
const articleUrlSchema = z.string().refine(
  (url) => {
    const sanitized = sanitizeUrl(url);
    return sanitized !== null;
  },
  { message: "URL no válida" }
);

// Text content validation with sanitization
const textContentSchema = z
  .string()
  .min(100, "El contenido debe tener al menos 100 caracteres")
  .max(50000, "El contenido no puede exceder 50.000 caracteres")
  .transform((text) => sanitizeText(text));

// Topic with sanitization
const topicSchema = z
  .string()
  .min(1)
  .max(50)
  .transform((topic) => sanitizeText(topic));

// Convert request schema with conditional validation
export const convertRequestSchema = z
  .object({
    inputType: inputTypeSchema,
    inputValue: z.string().min(1, "El contenido no puede estar vacío"),
    tone: toneSchema,
    topics: z
      .array(topicSchema)
      .max(5, "Máximo 5 temas permitidos")
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // Validate inputValue based on inputType
    if (data.inputType === "youtube") {
      const result = youtubeUrlSchema.safeParse(data.inputValue);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL de YouTube no válida",
          path: ["inputValue"],
        });
      }
    } else if (data.inputType === "article") {
      const result = articleUrlSchema.safeParse(data.inputValue);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL de artículo no válida",
          path: ["inputValue"],
        });
      }
    } else if (data.inputType === "text") {
      const result = textContentSchema.safeParse(data.inputValue);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ["inputValue"],
          });
        });
      }
    }
  });

export type ConvertRequest = z.infer<typeof convertRequestSchema>;

// Regenerate request schema
export const regenerateRequestSchema = z.object({
  outputId: z.string().uuid("El ID del output no es válido"),
  format: outputFormatSchema,
});

export type RegenerateRequest = z.infer<typeof regenerateRequestSchema>;

// Helper function to format Zod errors into Spanish messages
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "general";
    if (!errors[path]) {
      errors[path] = [];
    }

    // Provide Spanish translations for common Zod errors
    let message = issue.message;
    if (message === "Required") {
      message = "Este campo es obligatorio";
    } else if (message.includes("Invalid enum value")) {
      message = "Valor no válido";
    } else if (message.includes("Invalid uuid")) {
      message = "El ID no es válido";
    }

    errors[path].push(message);
  }

  return errors;
}
