import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { validateCSRF } from "@/lib/csrf";

export async function DELETE(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

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

    // Use admin client for operations that require service role
    const supabaseAdmin = createAdminClient();

    // Cancel Stripe subscription if exists
    const { data: userData } = await supabaseAdmin
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
    const { data: conversions } = await supabaseAdmin
      .from("conversions")
      .select("id")
      .eq("user_id", user.id);

    if (conversions && conversions.length > 0) {
      const conversionIds = conversions.map((c) => c.id);
      await supabaseAdmin
        .from("outputs")
        .delete()
        .in("conversion_id", conversionIds);
    }

    // Delete user's conversions
    await supabaseAdmin.from("conversions").delete().eq("user_id", user.id);

    // Delete user record from users table
    await supabaseAdmin.from("users").delete().eq("id", user.id);

    // Delete the auth user using admin privileges
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      // User data is already deleted, log error but don't fail
    }

    console.log(`User ${user.id} (${user.email}) deleted successfully`);

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
