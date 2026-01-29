"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "distribuia-cookie-consent";

/**
 * Cookie Consent Banner
 *
 * We only use essential cookies (authentication, payments) and
 * Plausible analytics (which uses no cookies).
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
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

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-label="Consentimiento de cookies"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          Usamos solo cookies esenciales para el funcionamiento del sitio (autenticación y pagos).
          Nuestras analíticas (Plausible) no usan cookies ni rastrean datos personales.{" "}
          <Link href="/privacidad" className="text-primary hover:underline">
            Política de privacidad
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
