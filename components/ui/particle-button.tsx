"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ParticleButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

function SuccessParticles({ buttonRef }: { buttonRef: React.RefObject<HTMLAnchorElement | null> }) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    <AnimatePresence>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2 h-2 bg-primary rounded-full pointer-events-none z-50"
          style={{ left: centerX, top: centerY }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 60 + 30)],
            y: [0, (i < 4 ? -1 : 1) * (Math.random() * 40 + 20)],
          }}
          transition={{
            duration: 0.7,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

export function ParticleButton({
  href,
  children,
  className = "",
  variant = "primary",
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const handleClick = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 800);
  };

  const baseClasses = variant === "primary"
    ? "bg-primary hover:bg-primary-dark text-white"
    : "border border-gray-300 text-navy hover:bg-gray-50";

  return (
    <>
      {showParticles && <SuccessParticles buttonRef={buttonRef} />}
      <Link
        ref={buttonRef}
        href={href}
        onClick={handleClick}
        className={`
          relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg
          transition-all duration-200
          ${showParticles ? "scale-95" : "scale-100"}
          animate-pulse-subtle
          ${baseClasses}
          ${className}
        `}
      >
        {children}
      </Link>
    </>
  );
}
