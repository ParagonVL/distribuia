import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlanManagement from "./plan-management";
import { ChangePasswordButton, DeleteAccountButton } from "./account-actions";
import type { PlanType } from "@/lib/config/plans";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user data including plan and Stripe info
  const { data: userData } = await supabase
    .from("users")
    .select("plan, stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const currentPlan = (userData?.plan || "free") as PlanType;
  const hasStripeSubscription = !!userData?.stripe_subscription_id;

  return (
    <div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-8">
        Configuracion
      </h1>

      <div className="space-y-6">
        {/* Plan management */}
        <div className="card">
          <h2 className="font-heading text-lg font-semibold text-navy mb-6">
            Tu plan
          </h2>
          <PlanManagement
            currentPlan={currentPlan}
            hasStripeSubscription={hasStripeSubscription}
          />
        </div>

        {/* Account info */}
        <div className="card">
          <h2 className="font-heading text-lg font-semibold text-navy mb-4">
            Informacion de la cuenta
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-navy">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                ID de usuario
              </label>
              <p className="text-navy font-mono text-sm">{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <h2 className="font-heading text-lg font-semibold text-navy mb-4">
            Seguridad
          </h2>
          <ChangePasswordButton userEmail={user.email || ""} />
        </div>

        {/* Danger zone */}
        <div className="card border-error/20">
          <h2 className="font-heading text-lg font-semibold text-error mb-4">
            Zona peligrosa
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Al eliminar tu cuenta, se borraran todos tus datos permanentemente.
            Esta accion no se puede deshacer.
          </p>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
