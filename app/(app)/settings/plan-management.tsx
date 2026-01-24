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
        body: JSON.stringify({ priceId: PLAN_PRICES[plan].priceId }),
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

  const plans: { key: PlanType; name: string; price: string; features: string[] }[] = [
    {
      key: "free",
      name: "Free",
      price: "0",
      features: [
        `${PLAN_LIMITS.free.conversionsPerMonth} conversiones/mes`,
        `${PLAN_LIMITS.free.regeneratesPerConversion} regeneracion por contenido`,
        "Todos los formatos de salida",
      ],
    },
    {
      key: "starter",
      name: "Starter",
      price: "19",
      features: [
        `${PLAN_LIMITS.starter.conversionsPerMonth} conversiones/mes`,
        `${PLAN_LIMITS.starter.regeneratesPerConversion} regeneraciones por contenido`,
        "Todos los formatos de salida",
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
                  ? "border-primary bg-primary/5"
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
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded-full mb-3">
                  Plan actual
                </span>
              )}
              <h3 className="font-heading text-xl font-bold text-navy">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-navy">{plan.price}€</span>
                <span className="text-gray-500">/mes</span>
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
                    {feature}
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
                <button
                  onClick={() => handleUpgrade(plan.key as "starter" | "pro")}
                  disabled={loading === plan.key}
                  className={`w-full text-sm py-2.5 rounded-lg font-medium transition-all ${
                    isPopular
                      ? "bg-gradient-to-r from-primary to-teal-400 text-white hover:from-primary-dark hover:to-teal-500 shadow-lg shadow-primary/30 hover:shadow-primary/50"
                      : "bg-gray-100 text-navy hover:bg-gray-200"
                  }`}
                >
                  {loading === plan.key ? "Cargando..." : "Cambiar a " + plan.name}
                </button>
              ) : isDowngrade && hasStripeSubscription ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === "portal"}
                  className="w-full btn-secondary text-sm"
                >
                  {loading === "portal" ? "Cargando..." : "Cambiar plan"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Cancel subscription link */}
      {hasStripeSubscription && (
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={handleManageSubscription}
            disabled={loading === "portal"}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {loading === "portal" ? "Cargando..." : "Cancelar suscripcion"}
          </button>
        </div>
      )}
    </div>
  );
}
