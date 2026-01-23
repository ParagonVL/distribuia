"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sliders, Copy, Sparkles } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Pega el enlace",
    description: "Introduce una URL de YouTube, un articulo web o simplemente pega el texto que quieras transformar.",
  },
  {
    icon: Sliders,
    title: "Elige el tono",
    description: "Selecciona entre profesional, cercano o tecnico. El contenido se adapta a tu estilo personal.",
  },
  {
    icon: Copy,
    title: "Copia y publica",
    description: "Obtén posts listos para LinkedIn y X. Solo copia, pega y publica en tus redes.",
  },
  {
    icon: Sparkles,
    title: "Español nativo",
    description: "Contenido generado en español real, no traducido. Suena natural y profesional.",
  },
];

export function FeaturesCarousel() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentFeature((current) => (current + 1) % features.length);
          return 0;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleFeatureClick = (index: number) => {
    setCurrentFeature(index);
    setProgress(0);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Feature list */}
      <div className="space-y-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = currentFeature === index;

          return (
            <button
              key={index}
              onClick={() => handleFeatureClick(index)}
              className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-white shadow-lg border border-primary/20"
                  : "bg-transparent hover:bg-white/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-navy mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  {isActive && (
                    <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary-dark"
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

      {/* Feature visual */}
      <div className="relative h-80 lg:h-96 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="text-center">
              {(() => {
                const Icon = features[currentFeature].icon;
                return (
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                );
              })()}
              <h4 className="font-heading text-2xl font-bold text-navy mb-3">
                {features[currentFeature].title}
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                {features[currentFeature].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
