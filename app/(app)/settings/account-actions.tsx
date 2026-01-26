"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AccountActionsProps {
  userEmail: string;
}

export function ChangePasswordButton({ userEmail }: AccountActionsProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
        <p className="text-sm text-success">
          Te hemos enviado un email a <strong>{userEmail}</strong> con instrucciones para cambiar tu contraseña.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      <button
        onClick={handleChangePassword}
        disabled={loading}
        className="btn-secondary"
      >
        {loading ? "Enviando..." : "Cambiar contraseña"}
      </button>
      <p className="mt-2 text-xs text-gray-600">
        Recibirás un email con un enlace para cambiar tu contraseña.
      </p>
    </div>
  );
}

export function DeleteAccountButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (confirmText !== "ELIMINAR") return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Error al eliminar la cuenta");
      }

      // Sign out and redirect
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?deleted=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium border border-error text-error hover:bg-error/10 transition-colors"
      >
        Eliminar cuenta
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
        <p className="text-sm text-navy mb-4">
          Esta acción es <strong>irreversible</strong>. Se eliminarán:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li>• Todas tus conversiones y contenido generado</li>
          <li>• Tu historial de uso</li>
          <li>• Tu suscripción (si la tienes)</li>
        </ul>
        <p className="text-sm text-navy mb-3">
          Escribe <strong>ELIMINAR</strong> para confirmar:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="ELIMINAR"
          className="input mb-4"
          disabled={loading}
        />
        <div className="flex gap-3">
          <button
            onClick={handleDeleteAccount}
            disabled={confirmText !== "ELIMINAR" || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmText === "ELIMINAR" && !loading
                ? "bg-error text-white hover:bg-error/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Eliminando..." : "Confirmar eliminación"}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              setConfirmText("");
              setError(null);
            }}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-navy hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
