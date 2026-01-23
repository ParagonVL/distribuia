"use client";

import { motion } from "framer-motion";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    strokeWidth: 0.5 + i * 0.03,
    opacity: 0.1 + i * 0.02,
    duration: 20 + Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full text-primary"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background decoration</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.strokeWidth}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.3, pathOffset: 0 }}
            animate={{
              pathLength: 0.8,
              pathOffset: [0, 1],
              opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
            }}
            transition={{
              duration: path.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths() {
  return (
    <>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </>
  );
}
