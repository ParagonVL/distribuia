"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PlanType } from "@/lib/config/plans";

interface BillingClientProps {
  currentPlan: PlanType;
  planName: string;
  planDescription: string;
  conversionsUsed: number;
  conversionsLimit: number;
  hasStripeSubscription: boolean;
  showSuccess: boolean;
  showCanceled: boolean;
  cancelAt: string | null;
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

export function BillingClient({
  currentPlan,
  planName,
  planDescription,
  conversionsUsed,
  conversionsLimit,
  hasStripeSubscription,
  showSuccess,
  showCanceled,
  cancelAt,
}: BillingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(showSuccess);
  const [canceledVisible, setCanceledVisible] = useState(showCanceled);
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  // Check if user can upgrade (needs waiver)
  const canUpgrade = currentPlan === "free" || currentPlan === "starter";

  // Format cancellation date
  const formatCancelDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Auto-hide messages after 10 seconds
  useEffect(() => {
    if (successVisible) {
      const timer = setTimeout(() => setSuccessVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [successVisible]);

  useEffect(() => {
    if (canceledVisible) {
      const timer = setTimeout(() => setCanceledVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [canceledVisible]);

  // Clear URL params after showing message
  useEffect(() => {
    if (showSuccess || showCanceled) {
      window.history.replaceState({}, "", "/billing");
    }
  }, [showSuccess, showCanceled]);

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

  const plans = [
    {
      id: "free" as const,
      name: "Free",
      price: 0,
      features: ["2 conversiones/mes", "1 regeneracion por conversion", "Todos los formatos"],
      limitations: ["Incluye marca de agua"],
    },
    {
      id: "starter" as const,
      name: "Starter",
      price: 19,
      features: [
        "10 conversiones/mes",
        "3 regeneraciones por conversion",
        "Todos los formatos",
        "Sin marca de agua",
        "Historial completo",
      ],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: 49,
      popular: true,
      features: [
        "30 conversiones/mes",
        "3 regeneraciones por conversion",
        "Todos los formatos",
        "Sin marca de agua",
        "Historial completo",
        "Soporte prioritario",
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
          Facturacion
        </h1>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver a generar
        </a>
      </div>

      {/* Success message */}
      {successVisible && (
        <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-success">Pago completado correctamente</p>
              <p className="text-sm text-gray-600 mt-1">
                Tu suscripcion se esta procesando. Los cambios pueden tardar unos segundos en reflejarse.
                Si no ves tu nuevo plan, recarga la pagina.
              </p>
              <button
                onClick={() => router.refresh()}
                className="mt-2 text-sm text-primary hover:text-primary-dark font-medium"
              >
                Recargar pagina
              </button>
            </div>
            <button
              onClick={() => setSuccessVisible(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Canceled message */}
      {canceledVisible && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800">Pago cancelado</p>
              <p className="text-sm text-amber-700 mt-1">
                No se ha realizado ningun cargo. Puedes intentarlo de nuevo cuando quieras.
              </p>
            </div>
            <button
              onClick={() => setCanceledVisible(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Subscription scheduled for cancellation notice */}
      {cancelAt && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800">Suscripcion programada para cancelar</p>
              <p className="text-sm text-amber-700 mt-1">
                Tu suscripcion se cancelara el <strong>{formatCancelDate(cancelAt)}</strong>.
                Hasta esa fecha, mantendras acceso a todas las funciones de tu plan actual.
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={loading === "portal"}
                className="mt-2 text-sm text-primary hover:text-primary-dark font-medium"
              >
                {loading === "portal" ? "Cargando..." : "Reactivar suscripcion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className="card mb-8">
        <h2 className="font-heading text-lg font-semibold text-navy mb-4">
          Tu plan actual
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-navy">{planName}</p>
            <p className="text-gray-500">{planDescription}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Uso este mes</p>
            <p className="text-lg font-semibold text-navy">
              {conversionsUsed}/{conversionsLimit} conversiones
            </p>
          </div>
        </div>
        {hasStripeSubscription && currentPlan !== "free" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleManageSubscription}
              disabled={loading === "portal"}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              {loading === "portal" ? "Cargando..." : "Gestionar suscripcion en Stripe"}
            </button>
          </div>
        )}
      </div>

      {/* Plans grid */}
      <h2 className="font-heading text-lg font-semibold text-navy mb-4">
        Planes disponibles
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          const isUpgrade =
            (currentPlan === "free" && (p.id === "starter" || p.id === "pro")) ||
            (currentPlan === "starter" && p.id === "pro");
          const isDowngrade =
            (currentPlan === "pro" && (p.id === "starter" || p.id === "free")) ||
            (currentPlan === "starter" && p.id === "free");

          return (
            <div
              key={p.id}
              className={`card relative ${
                p.popular
                  ? "border-2 border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                  : ""
              } ${isCurrent ? "ring-2 ring-primary/50" : ""}`}
            >
              {/* Glow effect for popular plan */}
              {p.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-teal-400/20 rounded-xl blur-lg -z-10" />
              )}
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-teal-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-4 bg-navy text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Actual
                </span>
              )}

              <h3 className="font-heading text-xl font-semibold text-navy">
                {p.name}
              </h3>
              <p className="text-3xl font-bold text-navy mt-2">
                {p.price}€
                <span className="text-base font-normal text-gray-500">/mes</span>
              </p>

              <ul className="mt-4 space-y-2">
                {p.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-500">
                    <svg
                      className="w-5 h-5 text-success flex-shrink-0"
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
                    {p.id === "pro" && feature.startsWith("30") ? (
                      <>
                        <span className="font-bold text-lg text-navy">30</span>
                        {feature.replace(/^30/, '')}
                      </>
                    ) : feature}
                  </li>
                ))}
                {p.limitations?.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-2 text-sm text-amber-600">
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
                <button
                  disabled
                  className="w-full mt-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Plan actual
                </button>
              ) : isUpgrade ? (
                <div className="mt-6 space-y-3">
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
                    onClick={() => handleUpgrade(p.id as "starter" | "pro")}
                    disabled={loading === p.id || (!hasStripeSubscription && !waiverAccepted)}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                      (!hasStripeSubscription && !waiverAccepted)
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : p.popular
                          ? "bg-gradient-to-r from-primary to-teal-400 text-white hover:from-primary-dark hover:to-teal-500 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]"
                          : "bg-gray-100 text-navy hover:bg-gray-200"
                    }`}
                  >
                    {loading === p.id ? "Cargando..." : "Cambiar a " + p.name}
                  </button>
                </div>
              ) : isDowngrade && hasStripeSubscription ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === "portal"}
                  className={`w-full mt-6 py-2.5 rounded-lg font-medium transition-all ${
                    p.id === "free"
                      ? "bg-error/10 text-error hover:bg-error/20 border border-error/30"
                      : "bg-gray-100 text-navy hover:bg-gray-200"
                  }`}
                >
                  {loading === "portal" ? "Cargando..." : p.id === "free" ? "Cancelar suscripcion" : "Cambiar plan"}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full mt-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  No disponible
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment info */}
      <div className="card mt-8">
        <h2 className="font-heading text-lg font-semibold text-navy mb-4">
          Informacion de pago
        </h2>
        <p className="text-gray-500 text-sm">
          Los pagos se gestionan de forma segura a traves de Stripe.
          Al cambiar de plan, seras redirigido al portal de pago de Stripe donde podras gestionar tu suscripcion y metodos de pago.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          <strong>Cambio de plan:</strong> Si ya tienes una suscripcion activa y quieres cambiar a un plan superior,
          Stripe calculara automaticamente la diferencia proporcional al tiempo restante de tu ciclo actual.
        </p>
      </div>
    </div>
  );
}
