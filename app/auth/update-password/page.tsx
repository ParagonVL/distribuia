"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PageState = "loading" | "ready" | "expired" | "error" | "success";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      // Check URL hash for errors (Supabase puts errors in hash)
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash.includes("error=")) {
          const params = new URLSearchParams(hash.substring(1));
          const errorCode = params.get("error_code");

          if (errorCode === "otp_expired") {
            setPageState("expired");
            return;
          }
          setPageState("error");
          return;
        }
      }

      // Supabase client automatically handles the hash and sets session
      // Wait a moment for the client to process the hash
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setPageState("ready");
      } else {
        // No session and no hash error - might be direct access
        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setPageState("ready");
        } else {
          setPageState("error");
        }
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setPageState("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Expired link state
  if (pageState === "expired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy mb-2">
            Enlace expirado
          </h1>
          <p className="text-gray-600 mb-6">
            El enlace para restablecer tu contraseña ha expirado. Por favor, solicita uno nuevo desde la configuración de tu cuenta.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/settings"
              className="w-full btn-primary py-3 text-center"
            >
              Ir a configuración
            </Link>
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

  // Generic error state
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy mb-2">
            Enlace no válido
          </h1>
          <p className="text-gray-600 mb-6">
            Este enlace no es válido o ya ha sido utilizado. Por favor, solicita uno nuevo.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/settings"
              className="w-full btn-primary py-3 text-center"
            >
              Ir a configuración
            </Link>
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

  // Success state
  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy mb-2">
            Contraseña actualizada
          </h1>
          <p className="text-gray-600">
            Redirigiendo al dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Ready state - show form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-heading text-2xl font-bold text-navy mb-4">
            distribuia
          </Link>
          <h1 className="font-heading text-2xl font-bold text-navy mb-2">
            Actualiza tu contraseña
          </h1>
          <p className="text-gray-600">
            Introduce tu nueva contraseña
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {formError && (
            <div id="form-error" className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg" role="alert">
              <p className="text-sm text-error">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={formError ? "form-error" : undefined}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input ${formError?.includes("8 caracteres") ? "border-error" : ""}`}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                aria-invalid={formError?.includes("8 caracteres") ? "true" : undefined}
                aria-describedby={formError ? "form-error" : "password-hint"}
              />
              <p id="password-hint" className="mt-1 text-xs text-gray-600">
                Mínimo 8 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input ${formError?.includes("coinciden") ? "border-error" : ""}`}
                placeholder="Repite la contraseña"
                required
                aria-invalid={formError?.includes("coinciden") ? "true" : undefined}
                aria-describedby={formError ? "form-error" : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
