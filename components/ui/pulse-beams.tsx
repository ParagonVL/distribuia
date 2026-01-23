"use client";

import React from "react";
import { motion } from "framer-motion";

interface PulseBeamsProps {
  children: React.ReactNode;
  className?: string;
}

export function PulseBeams({ children, className = "" }: PulseBeamsProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* SVG Beams Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <SVGBeams />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SVGBeams() {
  const beams = [
    {
      id: 1,
      path: "M100 400 Q200 300 300 250 Q400 200 450 200",
      delay: 0,
    },
    {
      id: 2,
      path: "M750 400 Q650 300 550 250 Q500 220 450 200",
      delay: 0.5,
    },
    {
      id: 3,
      path: "M50 200 Q150 200 250 180 Q350 160 450 200",
      delay: 1,
    },
    {
      id: 4,
      path: "M800 200 Q700 180 600 180 Q500 180 450 200",
      delay: 1.5,
    },
    {
      id: 5,
      path: "M200 50 Q300 100 400 150 Q430 180 450 200",
      delay: 0.3,
    },
    {
      id: 6,
      path: "M650 50 Q550 100 500 150 Q470 180 450 200",
      delay: 0.8,
    },
  ];

  return (
    <svg
      width="900"
      height="450"
      viewBox="0 0 900 450"
      fill="none"
      className="w-full h-full max-w-4xl opacity-60"
      preserveAspectRatio="xMidYMid slice"
    >
      {beams.map((beam) => (
        <React.Fragment key={beam.id}>
          {/* Base path (static, subtle) */}
          <path
            d={beam.path}
            stroke="rgba(20, 184, 166, 0.1)"
            strokeWidth="1"
            fill="none"
          />

          {/* Animated gradient path */}
          <path
            d={beam.path}
            stroke={`url(#gradient-${beam.id})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Connection point at center */}
          <circle
            cx="450"
            cy="200"
            r="4"
            fill="rgba(20, 184, 166, 0.3)"
          />
        </React.Fragment>
      ))}

      {/* Central glow */}
      <circle
        cx="450"
        cy="200"
        r="8"
        fill="rgba(20, 184, 166, 0.5)"
      />
      <circle
        cx="450"
        cy="200"
        r="16"
        fill="rgba(20, 184, 166, 0.2)"
      />

      {/* Gradient definitions */}
      <defs>
        {beams.map((beam) => (
          <motion.linearGradient
            key={beam.id}
            id={`gradient-${beam.id}`}
            gradientUnits="userSpaceOnUse"
            initial={{
              x1: "0%",
              y1: "0%",
              x2: "0%",
              y2: "0%",
            }}
            animate={{
              x1: ["0%", "100%", "100%"],
              y1: ["0%", "100%", "100%"],
              x2: ["0%", "100%", "100%"],
              y2: ["0%", "100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: beam.delay,
              repeatDelay: 1,
            }}
          >
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0" />
            <stop offset="30%" stopColor="#14B8A6" stopOpacity="1" />
            <stop offset="60%" stopColor="#F97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </motion.linearGradient>
        ))}
      </defs>
    </svg>
  );
}
