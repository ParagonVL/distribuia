import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addWatermarkIfNeeded, shouldAddWatermark, getPlanLimits } from "@/lib/config/plans";
import type { Conversion, Output, User } from "@/types/database";

/**
 * GET /api/conversion/[id]/status
 *
 * Returns the current status of a conversion and any completed outputs.
 * Used by the client to poll for progress during background generation.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: { code: "MISSING_ID", message: "Conversion ID is required" } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Debes iniciar sesión" } },
        { status: 401 }
      );
    }

    // Get conversion with ownership check
    const { data: conversion, error: conversionError } = await supabase
      .from("conversions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single<Conversion>();

    if (conversionError || !conversion) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Conversión no encontrada" } },
        { status: 404 }
      );
    }

    // Get user's plan for watermark logic
    const { data: userData } = await supabase
      .from("users")
      .select("plan, conversions_used_this_month")
      .eq("id", user.id)
      .single<Pick<User, "plan" | "conversions_used_this_month">>();

    const userPlan = userData?.plan || "free";
    const planLimits = getPlanLimits(userPlan);

    // Get any completed outputs
    const { data: outputs } = await supabase
      .from("outputs")
      .select("*")
      .eq("conversion_id", id)
      .order("created_at", { ascending: true });

    // Format outputs with watermarks if applicable
    const formattedOutputs: Record<string, { id: string; content: string; version: number }> = {};

    if (outputs && outputs.length > 0) {
      for (const output of outputs as Output[]) {
        const format = output.format as "x_thread" | "linkedin_post" | "linkedin_article";
        formattedOutputs[format] = {
          id: output.id,
          content: addWatermarkIfNeeded(output.content, format, userPlan),
          version: output.version,
        };
      }
    }

    // Build response based on status
    const response: {
      conversionId: string;
      status: string;
      error?: string;
      outputs?: typeof formattedOutputs;
      completedFormats?: string[];
      usage?: {
        conversionsUsed: number;
        conversionsLimit: number;
        regeneratesPerConversion: number;
      };
      hasWatermark?: boolean;
      source?: string;
      metadata?: {
        title?: string;
        videoId?: string;
      };
    } = {
      conversionId: conversion.id,
      status: conversion.status,
    };

    // Add error message if failed
    if (conversion.status === "failed" && conversion.error_message) {
      response.error = conversion.error_message;
    }

    // Add outputs if any exist
    if (Object.keys(formattedOutputs).length > 0) {
      response.outputs = formattedOutputs;
      response.completedFormats = Object.keys(formattedOutputs);
    }

    // Add usage info if completed
    if (conversion.status === "completed" && userData) {
      response.usage = {
        conversionsUsed: userData.conversions_used_this_month,
        conversionsLimit: planLimits.conversionsPerMonth,
        regeneratesPerConversion: planLimits.regeneratesPerConversion,
      };
      response.hasWatermark = shouldAddWatermark(userPlan);
      response.source = conversion.input_type;

      // Extract metadata if YouTube
      if (conversion.input_type === "youtube" && conversion.input_url) {
        const videoIdMatch = conversion.input_url.match(/(?:v=|\/)([\w-]{11})/);
        if (videoIdMatch) {
          response.metadata = { videoId: videoIdMatch[1] };
        }
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching conversion status:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Error al obtener el estado" } },
      { status: 500 }
    );
  }
}
