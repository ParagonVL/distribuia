"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy mb-2">
            distribuia
          </h1>
          <p className="text-gray-500">
            Acceso restringido
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-navy mb-2">
                Token de acceso
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Introduce el token"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-error">
                Token incorrecto. Intentalo de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                loading || !token
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark text-white"
              }`}
            >
              {loading ? "Verificando..." : "Acceder"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Sitio en desarrollo
        </p>
      </div>
    </div>
  );
}
