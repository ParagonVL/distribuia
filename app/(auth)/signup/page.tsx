"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-success"
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
            </div>
            <h2 className="font-heading text-xl font-bold text-navy mb-2">
              Revisa tu email
            </h2>
            <p className="text-gray-600 mb-4">
              Hemos enviado un enlace de confirmacion a{" "}
              <span className="font-medium text-navy">{email}</span>
            </p>
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="font-heading text-3xl font-bold text-navy">
            distribuia
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-heading font-bold text-navy">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6" aria-describedby={error ? "form-error" : undefined}>
            {error && (
              <div id="form-error" className="p-3 bg-error/10 border border-error/20 rounded-lg" role="alert">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navy"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`input mt-1 ${error ? "border-error" : ""}`}
                placeholder="tu@email.com"
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "form-error" : undefined}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-navy"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`input mt-1 ${error?.includes("contraseña") ? "border-error" : ""}`}
                placeholder="••••••••"
                aria-invalid={error?.includes("contraseña") ? "true" : undefined}
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="mt-1 text-xs text-gray-600">
                Mínimo 6 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-navy"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`input mt-1 ${error?.includes("coinciden") ? "border-error" : ""}`}
                placeholder="••••••••"
                aria-invalid={error?.includes("coinciden") ? "true" : undefined}
                aria-describedby={error ? "form-error" : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3"
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <p className="text-xs text-gray-600 text-center">
              Al crear una cuenta, aceptas nuestros{" "}
              <Link href="/terms" className="text-primary hover:text-primary-dark">
                términos de servicio
              </Link>{" "}
              y{" "}
              <Link href="/privacy" className="text-primary hover:text-primary-dark">
                politica de privacidad
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
