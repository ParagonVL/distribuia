import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateContent } from "@/lib/groq";
import { getPlanLimits, canRegenerate } from "@/lib/config/plans";
import {
  regenerateRequestSchema,
  formatZodErrors,
} from "@/lib/validations";
import {
  DistribuiaError,
  UnauthenticatedError,
  RegenerateLimitExceededError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type { OutputFormat, ToneType, Output, User } from "@/types/database";

interface OutputWithConversion extends Output {
  conversion: {
    id: string;
    user_id: string;
    input_text: string;
    tone: ToneType;
    topics: string[] | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const parseResult = regenerateRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = formatZodErrors(parseResult.error);
      return NextResponse.json(
        new ValidationError("Datos de entrada no válidos", errors).toJSON(),
        { status: 400 }
      );
    }

    const { outputId, format } = parseResult.data;

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthenticatedError();
    }

    // Get the output and verify ownership
    const { data: output, error: outputError } = await supabase
      .from("outputs")
      .select(
        `
        *,
        conversion:conversions (
          id,
          user_id,
          input_text,
          tone,
          topics
        )
      `
      )
      .eq("id", outputId)
      .single<OutputWithConversion>();

    if (outputError || !output) {
      throw new NotFoundError("output");
    }

    const { conversion } = output;

    // Verify ownership
    if (conversion.user_id !== user.id) {
      throw new NotFoundError("output");
    }

    // Verify the format matches
    if (output.format !== format) {
      throw new ValidationError("El formato no coincide con el output", {
        format: ["El formato especificado no coincide con el output original"],
      });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single<Pick<User, "plan">>();

    if (userError || !userData) {
      throw new UnauthenticatedError();
    }

    // Count existing versions for this conversion + format
    const { count: versionCount, error: countError } = await supabase
      .from("outputs")
      .select("*", { count: "exact", head: true })
      .eq("conversion_id", conversion.id)
      .eq("format", format);

    if (countError) {
      console.error("Error counting versions:", countError);
      throw new Error("Error al verificar límites de regeneración");
    }

    const currentVersionCount = versionCount || 1;
    const planLimits = getPlanLimits(userData.plan);

    // Check regenerate limit (version 1 is the original, so we compare with regenerates allowed)
    if (!canRegenerate(userData.plan, currentVersionCount)) {
      throw new RegenerateLimitExceededError(planLimits.regeneratesPerConversion);
    }

    // Generate new content
    const result = await regenerateContent(
      conversion.input_text,
      format as OutputFormat,
      conversion.tone,
      conversion.topics || undefined,
      output.content // Pass previous content to encourage variation
    );

    // Save new version
    const newVersion = currentVersionCount + 1;
    const { data: newOutput, error: insertError } = await supabase
      .from("outputs")
      .insert({
        conversion_id: conversion.id,
        format: format as OutputFormat,
        content: result.content,
        version: newVersion,
      })
      .select()
      .single<Output>();

    if (insertError || !newOutput) {
      console.error("Error saving new output:", insertError);
      throw new Error("Error al guardar el nuevo contenido");
    }

    return NextResponse.json({
      outputId: newOutput.id,
      content: newOutput.content,
      version: newOutput.version,
      format: newOutput.format,
      conversionId: conversion.id,
      usage: {
        versionsUsed: newVersion,
        versionsLimit: planLimits.regeneratesPerConversion + 1, // +1 for original
        canRegenerate: newVersion < planLimits.regeneratesPerConversion + 1,
      },
    });
  } catch (error) {
    console.error("Regenerate API error:", error);

    // Handle our custom errors
    if (error instanceof DistribuiaError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        },
      },
      { status: 500 }
    );
  }
}
