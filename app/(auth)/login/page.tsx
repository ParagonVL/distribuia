"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();

  // Client-side validation
  const validation = useMemo(() => {
    const emailValid = EMAIL_REGEX.test(email);
    const passwordValid = password.length > 0;
    return {
      email: { valid: emailValid, message: !emailValid && touched.email ? "Introduce un email válido" : null },
      password: { valid: passwordValid, message: !passwordValid && touched.password ? "La contraseña es obligatoria" : null },
      canSubmit: emailValid && passwordValid,
    };
  }, [email, password, touched]);

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validation.canSubmit) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes("Invalid login")) {
        setError("Email o contraseña incorrectos");
      } else if (authError.message.includes("Email not confirmed")) {
        setError("Por favor, confirma tu email antes de iniciar sesión");
      } else {
        setError("Ha ocurrido un error. Inténtalo de nuevo.");
      }
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

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
            Inicia sesión
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
                className={`input ${validation.email.message || error ? "border-error" : touched.email && validation.email.valid ? "border-success" : ""}`}
                placeholder="tu@email.com"
                aria-invalid={validation.email.message || error ? "true" : undefined}
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
                autoComplete="current-password"
                className={`input ${validation.password.message || error ? "border-error" : touched.password && validation.password.valid ? "border-success" : ""}`}
                placeholder="••••••••"
                aria-invalid={validation.password.message || error ? "true" : undefined}
                aria-describedby={validation.password.message ? "password-error" : error ? "form-error" : undefined}
              />
              {validation.password.message && (
                <p id="password-error" className="mt-1 text-xs text-error" role="alert">
                  {validation.password.message}
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
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
