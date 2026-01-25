"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contrasena");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy mb-2">
            Contrasena actualizada
          </h1>
          <p className="text-gray-600">
            Redirigiendo al dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-heading text-2xl font-bold text-navy mb-4">
            distribuia
          </Link>
          <h1 className="font-heading text-2xl font-bold text-navy mb-2">
            Actualiza tu contrasena
          </h1>
          <p className="text-gray-600">
            Introduce tu nueva contrasena
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div id="form-error" className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg" role="alert">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={error ? "form-error" : undefined}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
                Nueva contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input ${error?.includes("8 caracteres") ? "border-error" : ""}`}
                placeholder="Minimo 8 caracteres"
                required
                minLength={8}
                aria-invalid={error?.includes("8 caracteres") ? "true" : undefined}
                aria-describedby={error ? "form-error" : "password-hint"}
              />
              <p id="password-hint" className="mt-1 text-xs text-gray-600">
                Mínimo 8 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1">
                Confirmar contrasena
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input ${error?.includes("coinciden") ? "border-error" : ""}`}
                placeholder="Repite la contrasena"
                required
                aria-invalid={error?.includes("coinciden") ? "true" : undefined}
                aria-describedby={error ? "form-error" : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? "Actualizando..." : "Actualizar contrasena"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
