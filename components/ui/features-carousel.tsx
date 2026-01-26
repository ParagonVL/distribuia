"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link2, Sliders, Copy, Sparkles } from "lucide-react";
import {
  PegaEnlaceAnimation,
  EligeTonoAnimation,
  CopiaPublicaAnimation,
  EspanolNativoAnimation,
} from "./step-animations";

const features = [
  {
    icon: Link2,
    title: "Pega el enlace",
    description: "Introduce una URL de YouTube, un artículo web o simplemente pega el texto que quieras transformar.",
    Animation: PegaEnlaceAnimation,
  },
  {
    icon: Sliders,
    title: "Elige el tono",
    description: "Selecciona entre profesional, cercano o técnico. El contenido se adapta a tu estilo personal.",
    Animation: EligeTonoAnimation,
  },
  {
    icon: Copy,
    title: "Copia y publica",
    description: "Obten posts listos para LinkedIn y X. Solo copia, pega y publica en tus redes.",
    Animation: CopiaPublicaAnimation,
  },
  {
    icon: Sparkles,
    title: "Espanol nativo",
    description: "Contenido generado en espanol real, no traducido. Suena natural y profesional.",
    Animation: EspanolNativoAnimation,
  },
];

export function FeaturesCarousel() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  useEffect(() => {
    // Only start the interval when the section is in view
    if (isInView) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentFeature((current) => (current + 1) % features.length);
            return 0;
          }
          return prev + 1.5;
        });
      }, 64);
    } else {
      // Clear interval when out of view
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInView]);

  const handleFeatureClick = (index: number) => {
    setCurrentFeature(index);
    setProgress(0);
  };

  const CurrentAnimation = features[currentFeature].Animation;

  return (
    <div ref={containerRef} className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
      {/* Feature list */}
      <div className="space-y-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = currentFeature === index;

          return (
            <button
              key={index}
              onClick={() => handleFeatureClick(index)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-white/10 backdrop-blur-sm shadow-lg border border-primary/30"
                  : "bg-transparent hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                    isActive ? "bg-primary text-white" : "bg-white/10 text-white/60"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-heading text-base font-semibold mb-1 ${
                    isActive ? "text-white" : "text-white/80"
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed line-clamp-2 ${
                    isActive ? "text-white/70" : "text-white/50"
                  }`}>
                    {feature.description}
                  </p>
                  {isActive && (
                    <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.08, ease: "linear" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Animation display */}
      <div className="relative h-72 lg:h-80 rounded-2xl bg-white shadow-2xl border border-white/20 overflow-hidden">
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <CurrentAnimation />
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-16 h-16 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-20 h-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
