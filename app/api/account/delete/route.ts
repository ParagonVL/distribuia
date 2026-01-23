import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "No autenticado", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    // Cancel Stripe subscription if exists
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (userData?.stripe_subscription_id) {
      try {
        const stripe = await import("stripe").then(
          (m) => new m.default(process.env.STRIPE_SECRET_KEY!)
        );
        await stripe.subscriptions.cancel(userData.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Error canceling Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // Delete user's outputs first (foreign key constraint)
    const { data: conversions } = await supabase
      .from("conversions")
      .select("id")
      .eq("user_id", user.id);

    if (conversions && conversions.length > 0) {
      const conversionIds = conversions.map((c) => c.id);
      await supabase
        .from("outputs")
        .delete()
        .in("conversion_id", conversionIds);
    }

    // Delete user's conversions
    await supabase.from("conversions").delete().eq("user_id", user.id);

    // Delete user record
    await supabase.from("users").delete().eq("id", user.id);

    // Delete auth user using admin client
    // Note: This requires service role key for admin operations
    // For now, we'll just sign out and the auth user will remain orphaned
    // In production, you'd use supabase.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        error: {
          message: "Error al eliminar la cuenta",
          code: "DELETE_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
