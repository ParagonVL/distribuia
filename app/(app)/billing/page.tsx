import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/config/plans";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    userData = data;
  }

  const plan = userData?.plan || "free";
  const planLimits = getPlanLimits(plan);
  const conversionsUsed = userData?.conversions_used_this_month || 0;

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      conversions: 2,
      regenerates: 1,
      features: ["2 conversiones/mes", "1 regeneracion por conversion", "Todos los formatos"],
    },
    {
      id: "starter",
      name: "Starter",
      price: 9,
      conversions: 10,
      regenerates: 3,
      popular: true,
      features: [
        "10 conversiones/mes",
        "3 regeneraciones por conversion",
        "Todos los formatos",
        "Historial completo",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 19,
      conversions: 30,
      regenerates: 3,
      features: [
        "30 conversiones/mes",
        "3 regeneraciones por conversion",
        "Todos los formatos",
        "Historial completo",
        "Soporte prioritario",
      ],
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-8">
        Facturacion
      </h1>

      {/* Current plan */}
      <div className="card mb-8">
        <h2 className="font-heading text-lg font-semibold text-navy mb-4">
          Tu plan actual
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-navy">{planLimits.name}</p>
            <p className="text-gray-500">{planLimits.description}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Uso este mes</p>
            <p className="text-lg font-semibold text-navy">
              {conversionsUsed}/{planLimits.conversionsPerMonth} conversiones
            </p>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <h2 className="font-heading text-lg font-semibold text-navy mb-4">
        Planes disponibles
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`card relative ${
              p.popular ? "border-2 border-primary" : ""
            } ${plan === p.id ? "ring-2 ring-primary/50" : ""}`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-navy text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </span>
            )}
            {plan === p.id && (
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
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled={plan === p.id}
              className={`w-full mt-6 py-2 rounded-lg font-medium transition-colors ${
                plan === p.id
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : p.popular
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-gray-100 text-navy hover:bg-gray-200"
              }`}
            >
              {plan === p.id ? "Plan actual" : "Cambiar a " + p.name}
            </button>
          </div>
        ))}
      </div>

      {/* Payment info placeholder */}
      <div className="card mt-8">
        <h2 className="font-heading text-lg font-semibold text-navy mb-4">
          Metodo de pago
        </h2>
        <p className="text-gray-500 text-sm">
          No hay metodo de pago configurado. Anade uno para cambiar a un plan de pago.
        </p>
        <button className="btn-secondary mt-4">Anadir metodo de pago</button>
      </div>
    </div>
  );
}
