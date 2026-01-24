"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "distribuia-cookie-consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      accepted_at: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const handleReject = () => {
    // User rejects non-essential cookies (we only use essential anyway)
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true, // Essential cookies are always allowed
      accepted_at: new Date().toISOString(),
      rejected_non_essential: true,
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-label="Consentimiento de cookies"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          Usamos cookies esenciales para el funcionamiento del sitio (autenticacion, pagos).
          No usamos cookies de seguimiento ni publicidad.{" "}
          <Link href="/privacidad" className="text-primary hover:underline">
            Mas informacion
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Solo esenciales
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
