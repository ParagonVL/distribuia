"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeamConfig {
  initialX: number;
  translateX: number;
  duration: number;
  repeatDelay: number;
  delay?: number;
  className?: string;
}

const beams: BeamConfig[] = [
  { initialX: 10, translateX: 10, duration: 7, repeatDelay: 3, delay: 2 },
  { initialX: 600, translateX: 600, duration: 3, repeatDelay: 3, delay: 4 },
  { initialX: 100, translateX: 100, duration: 7, repeatDelay: 7, className: "h-6" },
  { initialX: 400, translateX: 400, duration: 5, repeatDelay: 14, delay: 4 },
  { initialX: 800, translateX: 800, duration: 11, repeatDelay: 2, className: "h-20" },
  { initialX: 1000, translateX: 1000, duration: 4, repeatDelay: 2, className: "h-12" },
  { initialX: 1200, translateX: 1200, duration: 6, repeatDelay: 4, delay: 2, className: "h-6" },
];

function CollisionMechanism({
  beamConfig,
  containerRef,
}: {
  beamConfig: BeamConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const beamRef = useRef<HTMLDivElement>(null);
  const [collision, setCollision] = useState<{
    detected: boolean;
    coordinates: { x: number; y: number } | null;
  }>({ detected: false, coordinates: null });
  const [cycleCollision, setCycleCollision] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (beamRef.current && containerRef.current && !cycleCollision) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - containerRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - containerRect.top;

          setCollision({ detected: true, coordinates: { x: relativeX, y: relativeY } });
          setCycleCollision(true);
        }
      }
    };

    const interval = setInterval(checkCollision, 50);
    return () => clearInterval(interval);
  }, [cycleCollision, containerRef]);

  useEffect(() => {
    if (cycleCollision) {
      const timeout = setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollision(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [cycleCollision]);

  return (
    <>
      <motion.div
        ref={beamRef}
        initial={{ translateY: -200, translateX: beamConfig.initialX }}
        animate={{ translateY: 1200, translateX: beamConfig.translateX }}
        transition={{
          duration: beamConfig.duration,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamConfig.delay || 0,
          repeatDelay: beamConfig.repeatDelay,
        }}
        className={`absolute left-0 top-0 m-auto h-14 w-0.5 rounded-full bg-gradient-to-t from-primary via-primary/50 to-transparent ${beamConfig.className || ""}`}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion x={collision.coordinates.x} y={collision.coordinates.y} />
        )}
      </AnimatePresence>
    </>
  );
}

function Explosion({ x, y }: { x: number; y: number }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 16,
    velocity: 1 + Math.random() * 2,
  }));

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos((particle.angle * Math.PI) / 180) * 30 * particle.velocity,
            y: Math.sin((particle.angle * Math.PI) / 180) * 30 * particle.velocity,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute block h-1 w-1 rounded-full bg-primary"
        />
      ))}
      <motion.span
        initial={{ opacity: 1, scale: 0 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary/40 to-transparent"
      />
    </div>
  );
}

interface BackgroundBeamsProps {
  children: React.ReactNode;
  className?: string;
}

export function BackgroundBeams({ children, className = "" }: BackgroundBeamsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={parentRef}
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      {/* Beams container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {beams.map((beam, index) => (
          <CollisionMechanism
            key={index}
            beamConfig={beam}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Collision detection line (invisible) */}
      <div
        ref={containerRef}
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "transparent" }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}
