import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";

/**
 * GET /api/user/export
 * GDPR Article 20: Right to data portability
 * Returns all user data in JSON format
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    // Fetch user profile data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError) {
      logger.error("Error fetching user data for export", userError);
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Error al obtener los datos" } },
        { status: 500 }
      );
    }

    // Fetch all conversions with outputs
    const { data: conversions, error: conversionsError } = await supabase
      .from("conversions")
      .select(`
        id,
        input_type,
        input_url,
        input_text,
        tone,
        topics,
        created_at,
        outputs (
          id,
          format,
          content,
          version,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (conversionsError) {
      logger.error("Error fetching conversions for export", conversionsError);
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Error al obtener las conversiones" } },
        { status: 500 }
      );
    }

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
      },
      profile: {
        plan: userData?.plan,
        conversionsUsedThisMonth: userData?.conversions_used_this_month,
        billingCycleStart: userData?.billing_cycle_start,
        stripeCustomerId: userData?.stripe_customer_id ? "[REDACTED]" : null,
        createdAt: userData?.created_at,
      },
      conversions: conversions?.map((conv) => ({
        id: conv.id,
        inputType: conv.input_type,
        inputUrl: conv.input_url,
        inputText: conv.input_text,
        tone: conv.tone,
        topics: conv.topics,
        createdAt: conv.created_at,
        outputs: conv.outputs?.map((out: {
          id: string;
          format: string;
          content: string;
          version: number;
          created_at: string;
        }) => ({
          id: out.id,
          format: out.format,
          content: out.content,
          version: out.version,
          createdAt: out.created_at,
        })),
      })),
      statistics: {
        totalConversions: conversions?.length || 0,
        totalOutputs: conversions?.reduce(
          (acc, conv) => acc + (conv.outputs?.length || 0),
          0
        ) || 0,
      },
    };

    logger.info("User data export generated", { userId: user.id });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="distribuia-export-${user.id.slice(0, 8)}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    logger.error("Error exporting user data", error);
    return NextResponse.json(
      { error: { code: "EXPORT_ERROR", message: "Error al exportar los datos" } },
      { status: 500 }
    );
  }
}
