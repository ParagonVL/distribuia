"use client";

import { motion } from "framer-motion";

interface AnimatedWordProps {
  children: React.ReactNode;
  className?: string;
}

export function PulsatingWord({ children, className = "" }: AnimatedWordProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{
        scale: [1, 1.05, 1],
        textShadow: [
          "0 0 0px rgba(20, 184, 166, 0)",
          "0 0 20px rgba(20, 184, 166, 0.5)",
          "0 0 0px rgba(20, 184, 166, 0)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.span>
  );
}
