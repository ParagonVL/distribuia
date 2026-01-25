"use client";

import { useState } from "react";
import { PLAN_LIMITS, type PlanType } from "@/lib/config/plans";

interface PlanManagementProps {
  currentPlan: PlanType;
  hasStripeSubscription: boolean;
}

const PLAN_PRICES: Record<Exclude<PlanType, "free">, { monthly: number; priceId: string }> = {
  starter: {
    monthly: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || "",
  },
  pro: {
    monthly: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "",
  },
};

export default function PlanManagement({
  currentPlan,
  hasStripeSubscription,
}: PlanManagementProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  // Check if user can upgrade (needs waiver)
  const _canUpgrade = currentPlan === "free" || currentPlan === "starter";

  const handleUpgrade = async (plan: "starter" | "pro") => {
    setLoading(plan);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ priceId: PLAN_PRICES[plan].priceId, waiverAccepted: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al crear la sesion de pago");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("portal");
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al acceder al portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(null);
    }
  };

  const plans: { key: PlanType; name: string; price: string; features: string[]; limitations?: string[] }[] = [
    {
      key: "free",
      name: "Free",
      price: "0",
      features: [
        `${PLAN_LIMITS.free.conversionsPerMonth} conversiones/mes`,
        `${PLAN_LIMITS.free.regeneratesPerConversion} regeneracion por contenido`,
        "Todos los formatos de salida",
      ],
      limitations: ["Incluye marca de agua"],
    },
    {
      key: "starter",
      name: "Starter",
      price: "19",
      features: [
        `${PLAN_LIMITS.starter.conversionsPerMonth} conversiones/mes`,
        `${PLAN_LIMITS.starter.regeneratesPerConversion} regeneraciones por contenido`,
        "Todos los formatos de salida",
        "Sin marca de agua",
        "Soporte por email",
      ],
    },
    {
      key: "pro",
      name: "Pro",
      price: "49",
      features: [
        `${PLAN_LIMITS.pro.conversionsPerMonth} conversiones/mes`,
        `${PLAN_LIMITS.pro.regeneratesPerConversion} regeneraciones por contenido`,
        "Todos los formatos de salida",
        "Sin marca de agua",
        "Soporte prioritario",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isUpgrade =
            (currentPlan === "free" && (plan.key === "starter" || plan.key === "pro")) ||
            (currentPlan === "starter" && plan.key === "pro");
          const isDowngrade =
            (currentPlan === "pro" && (plan.key === "starter" || plan.key === "free")) ||
            (currentPlan === "starter" && plan.key === "free");

          const isPopular = plan.key === "pro";

          return (
            <div
              key={plan.key}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                isCurrent
                  ? "ring-2 ring-primary/50"
                  : isPopular
                    ? "border-primary shadow-xl shadow-primary/20"
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Glow effect for popular plan */}
              {isPopular && !isCurrent && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-teal-400/20 rounded-xl blur-lg -z-10" />
              )}
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-teal-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-4 bg-navy text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Actual
                </span>
              )}
              <h3 className="font-heading text-xl font-bold text-navy">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-navy">{plan.price}€</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {/* Bold only the number 30 in Pro plan features */}
                    {plan.key === "pro" && feature.startsWith("30") ? (
                      <>
                        <span className="font-bold text-lg text-navy">30</span>
                        {feature.replace(/^30/, '')}
                      </>
                    ) : feature}
                  </li>
                ))}
                {plan.limitations?.map((limitation, idx) => (
                  <li key={`lim-${idx}`} className="flex items-start gap-2 text-sm text-amber-600">
                    <svg
                      className="w-5 h-5 text-amber-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    {limitation}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                hasStripeSubscription && plan.key !== "free" ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading === "portal"}
                    className="w-full btn-secondary text-sm"
                  >
                    {loading === "portal" ? "Cargando..." : "Gestionar suscripcion"}
                  </button>
                ) : null
              ) : isUpgrade ? (
                <div className="space-y-3">
                  {/* Waiver checkbox inside each upgrade card */}
                  {!hasStripeSubscription && (
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={waiverAccepted}
                        onChange={(e) => setWaiverAccepted(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-1"
                      />
                      <span>
                        Solicito acceso inmediato y renuncio al derecho de desistimiento de 14 dias (art. 103.m RDL 1/2007).
                      </span>
                    </label>
                  )}
                  <button
                    onClick={() => handleUpgrade(plan.key as "starter" | "pro")}
                    disabled={loading === plan.key || (!hasStripeSubscription && !waiverAccepted)}
                    className={`w-full text-sm py-2.5 rounded-lg font-medium transition-all ${
                      (!hasStripeSubscription && !waiverAccepted)
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : isPopular
                          ? "bg-gradient-to-r from-primary to-teal-400 text-white hover:from-primary-dark hover:to-teal-500 shadow-lg shadow-primary/30 hover:shadow-primary/50"
                          : "bg-gray-100 text-navy hover:bg-gray-200"
                    }`}
                  >
                    {loading === plan.key ? "Cargando..." : "Cambiar a " + plan.name}
                  </button>
                </div>
              ) : isDowngrade && hasStripeSubscription ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === "portal"}
                  className={`w-full text-sm py-2.5 rounded-lg font-medium transition-all ${
                    plan.key === "free"
                      ? "bg-error/10 text-error hover:bg-error/20 border border-error/30"
                      : "bg-gray-100 text-navy hover:bg-gray-200"
                  }`}
                >
                  {loading === "portal" ? "Cargando..." : plan.key === "free" ? "Cancelar suscripcion" : "Cambiar plan"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

    </div>
  );
}
