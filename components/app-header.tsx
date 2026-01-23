"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  userEmail: string;
  conversionsUsed: number;
  conversionsLimit: number;
}

export function AppHeader({
  userEmail,
  conversionsUsed,
  conversionsLimit,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const usagePercentage = (conversionsUsed / conversionsLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = conversionsUsed >= conversionsLimit;

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="font-heading text-xl font-bold text-navy">
              distribuia
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Usage indicator */}
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                isAtLimit
                  ? "bg-error/10 text-error"
                  : isNearLimit
                    ? "bg-warning/10 text-warning"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {conversionsUsed}/{conversionsLimit} conversiones
            </div>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-navy">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Historial
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Configuracion
                  </Link>
                  <Link
                    href="/billing"
                    className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Facturacion
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-50"
                  >
                    Cerrar sesion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
