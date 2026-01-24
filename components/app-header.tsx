"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const router = useRouter();

  const menuItems = [
    { href: "/history", label: "Historial" },
    { href: "/settings", label: "Configuracion" },
    { href: "/billing", label: "Facturacion" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isMenuOpen) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setIsMenuOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setIsMenuOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < menuItems.length ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : menuItems.length
        );
        break;
      case "Tab":
        setIsMenuOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isMenuOpen, menuItems.length]);

  // Focus menu item when focusedIndex changes
  useEffect(() => {
    if (isMenuOpen && focusedIndex >= 0) {
      menuItemsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const usagePercentage = (conversionsUsed / conversionsLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = conversionsUsed >= conversionsLimit;

  // Get status indicator for accessibility
  const getStatusIndicator = () => {
    if (isAtLimit) return { icon: "!", label: "Limite alcanzado" };
    if (isNearLimit) return { icon: "!", label: "Casi al limite" };
    return { icon: null, label: null };
  };

  const status = getStatusIndicator();

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
            {/* Usage indicator with accessible status */}
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                isAtLimit
                  ? "bg-error/10 text-error"
                  : isNearLimit
                    ? "bg-warning/10 text-warning"
                    : "bg-gray-100 text-gray-500"
              }`}
              role="status"
              aria-label={`${conversionsUsed} de ${conversionsLimit} conversiones usadas${status.label ? `. ${status.label}` : ""}`}
            >
              {status.icon && (
                <span className="font-bold" aria-hidden="true">
                  {status.icon}
                </span>
              )}
              <span>{conversionsUsed}/{conversionsLimit} conversiones</span>
            </div>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onKeyDown={handleKeyDown}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label={`Menu de usuario para ${userEmail}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-navy" aria-hidden="true">
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
                  aria-hidden="true"
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
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                  </div>
                  {menuItems.map((item, index) => (
                    <Link
                      key={item.href}
                      ref={(el) => { menuItemsRef.current[index] = el; }}
                      href={item.href}
                      role="menuitem"
                      tabIndex={focusedIndex === index ? 0 : -1}
                      className="block px-4 py-2 text-sm text-navy hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setFocusedIndex(-1);
                      }}
                      onKeyDown={handleKeyDown}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <hr className="my-1 border-gray-100" aria-hidden="true" />
                  <button
                    ref={(el) => { menuItemsRef.current[menuItems.length] = el; }}
                    onClick={handleSignOut}
                    role="menuitem"
                    tabIndex={focusedIndex === menuItems.length ? 0 : -1}
                    className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onKeyDown={handleKeyDown}
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
