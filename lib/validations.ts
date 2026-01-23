import { z } from "zod";

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

// Convert request schema
export const convertRequestSchema = z.object({
  inputType: inputTypeSchema,
  inputValue: z.string().min(1, "El contenido no puede estar vacío"),
  tone: toneSchema,
  topics: z
    .array(z.string().min(1).max(50))
    .max(5, "Máximo 5 temas permitidos")
    .optional()
    .nullable(),
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
