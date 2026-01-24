"use client";

import { useState, useEffect } from "react";

export function EmailPreferences() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Fetch current preferences
    fetch("/api/user/email-preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.emailNotificationsEnabled !== undefined) {
          setEnabled(data.emailNotificationsEnabled);
        }
      })
      .catch(() => {
        // Default to enabled on error
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotificationsEnabled: !enabled }),
      });

      if (response.ok) {
        setEnabled(!enabled);
        setMessage({
          type: "success",
          text: !enabled
            ? "Notificaciones activadas"
            : "Notificaciones desactivadas",
        });
      } else {
        setMessage({ type: "error", text: "Error al actualizar preferencias" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-navy">
            Notificaciones por email
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Recibe alertas cuando te queden pocas conversiones
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-gray-300"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-success" : "text-error"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
