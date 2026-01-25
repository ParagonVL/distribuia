"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  expired: {
    title: "Enlace expirado",
    description: "El enlace de verificacion ha expirado. Los enlaces son validos durante 24 horas por seguridad.",
  },
  already_used: {
    title: "Enlace ya utilizado",
    description: "Este enlace de verificacion ya ha sido usado. Si ya confirmaste tu email, puedes iniciar sesion directamente.",
  },
  not_confirmed: {
    title: "Email no confirmado",
    description: "Tu cuenta existe pero el email no ha sido confirmado. Solicita un nuevo enlace de verificacion.",
  },
  unknown: {
    title: "Enlace invalido",
    description: "El enlace que has usado no es valido. Puede que haya sido modificado o este incompleto.",
  },
};

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "unknown";
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.unknown;

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    setResendStatus("idle");

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendStatus("success");
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg aria-hidden="true" className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="font-heading text-2xl font-bold text-navy mb-2">
          {errorInfo.title}
        </h1>
        <p className="text-gray-600 mb-6">
          {errorInfo.description}
        </p>

        {/* Resend confirmation email form */}
        {(errorCode === "expired" || errorCode === "not_confirmed" || errorCode === "unknown") && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Introduce tu email para recibir un nuevo enlace:
            </p>
            <form onSubmit={handleResendEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <button
                type="submit"
                disabled={resending}
                className="w-full btn-secondary py-2 disabled:opacity-50"
              >
                {resending ? "Enviando..." : "Reenviar enlace de verificacion"}
              </button>
            </form>
            {resendStatus === "success" && (
              <p className="mt-2 text-sm text-success">
                Email enviado. Revisa tu bandeja de entrada.
              </p>
            )}
            {resendStatus === "error" && (
              <p className="mt-2 text-sm text-error">
                Error al enviar. Verifica el email e intenta de nuevo.
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full btn-primary py-3 text-center"
          >
            Ir a iniciar sesion
          </Link>
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  );
}
