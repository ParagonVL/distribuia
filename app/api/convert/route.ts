import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processInput } from "@/lib/processors";
import { generateAllFormats } from "@/lib/groq";
import { getPlanLimits, canCreateConversion } from "@/lib/config/plans";
import {
  convertRequestSchema,
  formatZodErrors,
} from "@/lib/validations";
import {
  DistribuiaError,
  UnauthenticatedError,
  ConversionLimitExceededError,
  ValidationError,
} from "@/lib/errors";
import type { OutputFormat, ToneType, User, Conversion, Output } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const parseResult = convertRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = formatZodErrors(parseResult.error);
      return NextResponse.json(
        new ValidationError("Datos de entrada no válidos", errors).toJSON(),
        { status: 400 }
      );
    }

    const { inputType, inputValue, tone, topics } = parseResult.data;

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthenticatedError();
    }

    // Get user data and check limits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single<User>();

    if (userError || !userData) {
      throw new UnauthenticatedError();
    }

    // Check conversion limit
    const planLimits = getPlanLimits(userData.plan);
    if (!canCreateConversion(userData.plan, userData.conversions_used_this_month)) {
      throw new ConversionLimitExceededError(
        planLimits.conversionsPerMonth,
        planLimits.name
      );
    }

    // Process input (extract content from YouTube, article, or text)
    const processedInput = await processInput(inputType, inputValue);

    // Generate all three formats in parallel
    const generatedContent = await generateAllFormats(
      processedInput.content,
      tone as ToneType,
      topics || undefined
    );

    // Save conversion to database
    const { data: conversion, error: conversionError } = await supabase
      .from("conversions")
      .insert({
        user_id: user.id,
        input_type: inputType,
        input_url: inputType !== "text" ? inputValue : null,
        input_text: processedInput.content,
        tone: tone as ToneType,
        topics: topics || null,
      })
      .select()
      .single<Conversion>();

    if (conversionError || !conversion) {
      console.error("Error saving conversion:", conversionError);
      throw new Error("Error al guardar la conversión");
    }

    // Save all outputs
    const outputFormats: OutputFormat[] = [
      "x_thread",
      "linkedin_post",
      "linkedin_article",
    ];

    const outputInserts = outputFormats.map((format) => ({
      conversion_id: conversion.id,
      format,
      content: generatedContent[format].content,
      version: 1,
    }));

    const { data: outputs, error: outputsError } = await supabase
      .from("outputs")
      .insert(outputInserts)
      .select<"*", Output>();

    if (outputsError || !outputs) {
      console.error("Error saving outputs:", outputsError);
      // Try to clean up the conversion
      await supabase.from("conversions").delete().eq("id", conversion.id);
      throw new Error("Error al guardar los outputs");
    }

    // Increment user's conversion count
    const { error: updateError } = await supabase
      .from("users")
      .update({
        conversions_used_this_month: userData.conversions_used_this_month + 1,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user conversion count:", updateError);
      // Don't throw here, the conversion was successful
    }

    // Format response
    const outputsByFormat = outputs.reduce(
      (acc, output) => {
        acc[output.format] = {
          id: output.id,
          content: output.content,
          version: output.version,
        };
        return acc;
      },
      {} as Record<string, { id: string; content: string; version: number }>
    );

    return NextResponse.json({
      conversionId: conversion.id,
      source: processedInput.source,
      metadata: processedInput.metadata,
      outputs: {
        x_thread: outputsByFormat.x_thread,
        linkedin_post: outputsByFormat.linkedin_post,
        linkedin_article: outputsByFormat.linkedin_article,
      },
      usage: {
        conversionsUsed: userData.conversions_used_this_month + 1,
        conversionsLimit: planLimits.conversionsPerMonth,
        regeneratesPerConversion: planLimits.regeneratesPerConversion,
      },
    });
  } catch (error) {
    console.error("Convert API error:", error);

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
