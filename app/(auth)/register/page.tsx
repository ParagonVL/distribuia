"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });

  // Client-side validation
  const validation = useMemo(() => {
    const emailValid = EMAIL_REGEX.test(email);
    const passwordValid = password.length >= 6;
    const confirmValid = confirmPassword === password && confirmPassword.length > 0;
    return {
      email: { valid: emailValid, message: !emailValid && touched.email ? "Introduce un email válido" : null },
      password: { valid: passwordValid, message: !passwordValid && touched.password ? "Mínimo 6 caracteres" : null },
      confirmPassword: { valid: confirmValid, message: !confirmValid && touched.confirmPassword && confirmPassword.length > 0 ? "Las contraseñas no coinciden" : null },
      canSubmit: emailValid && passwordValid && confirmValid,
    };
  }, [email, password, confirmPassword, touched]);

  const handleBlur = (field: "email" | "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });
    setError(null);

    if (!validation.canSubmit) {
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        if (authError.message.includes("already registered")) {
          setError("Este email ya está registrado");
        } else if (authError.message.includes("valid email")) {
          setError("Por favor, introduce un email válido");
        } else if (authError.message.includes("password")) {
          setError("La contraseña no cumple los requisitos");
        } else {
          setError(`Error: ${authError.message}`);
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Registration error details:", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown",
        stack: err instanceof Error ? err.stack : undefined,
        email: email ? "provided" : "empty",
        passwordLength: password?.length,
      });
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error: ${errorMessage}`);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
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
            <h2 className="font-heading text-xl font-bold text-navy mb-3">
              ¡Revisa tu email!
            </h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de confirmación a{" "}
              <span className="font-medium text-navy">{email}</span>
            </p>
            <Link
              href="/login"
              className="text-primary hover:text-primary-dark font-medium"
            >
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
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>

        {/* Logo */}
        <Link href="/" className="flex justify-center mb-4 h-20 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Distribuia"
            width={360}
            height={240}
            className="w-[360px] h-auto -mt-10 -mb-14 object-contain"
            priority
          />
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-center text-2xl font-heading font-bold text-navy mb-8">
            Crea tu cuenta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5" aria-describedby={error ? "form-error" : undefined}>
            {error && (
              <div id="form-error" className="p-4 bg-error/10 border border-error/20 rounded-lg" role="alert">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navy mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                required
                autoComplete="email"
                className={`input ${validation.email.message || error?.includes("email") ? "border-error" : touched.email && validation.email.valid ? "border-success" : ""}`}
                placeholder="tu@email.com"
                aria-invalid={validation.email.message || error?.includes("email") ? "true" : undefined}
                aria-describedby={validation.email.message ? "email-error" : error ? "form-error" : undefined}
              />
              {validation.email.message && (
                <p id="email-error" className="mt-1 text-xs text-error" role="alert">
                  {validation.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-navy mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                required
                autoComplete="new-password"
                className={`input ${validation.password.message || error?.includes("contraseña") ? "border-error" : touched.password && validation.password.valid ? "border-success" : ""}`}
                placeholder="••••••••"
                aria-invalid={validation.password.message || error?.includes("contraseña") ? "true" : undefined}
                aria-describedby={validation.password.message ? "password-error" : "password-hint"}
              />
              {validation.password.message ? (
                <p id="password-error" className="mt-1 text-xs text-error" role="alert">
                  {validation.password.message}
                </p>
              ) : (
                <p id="password-hint" className="mt-1 text-xs text-gray-600">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-navy mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                required
                autoComplete="new-password"
                className={`input ${validation.confirmPassword.message || error?.includes("coinciden") ? "border-error" : touched.confirmPassword && validation.confirmPassword.valid ? "border-success" : ""}`}
                placeholder="••••••••"
                aria-invalid={validation.confirmPassword.message || error?.includes("coinciden") ? "true" : undefined}
                aria-describedby={validation.confirmPassword.message ? "confirm-error" : error ? "form-error" : undefined}
              />
              {validation.confirmPassword.message && (
                <p id="confirm-error" className="mt-1 text-xs text-error" role="alert">
                  {validation.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !validation.canSubmit}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLoading || !validation.canSubmit
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark text-white"
              }`}
            >
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    aria-hidden="true"
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
