"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { ParticleButton } from "./particle-button";

const plans = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    originalPrice: 0,
    description: "Para probar",
    conversions: 2,
    regenerations: 1,
    features: [
      "2 videos o articulos al mes",
      "1 version alternativa por contenido",
      "3 formatos: X, LinkedIn post y articulo",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    originalPrice: 39,
    description: "Para creadores activos",
    conversions: 10,
    regenerations: 3,
    features: [
      "10 videos o articulos al mes",
      "3 versiones alternativas por contenido",
      "3 formatos: X, LinkedIn post y articulo",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    originalPrice: 99,
    description: "Para profesionales",
    conversions: 30,
    regenerations: 3,
    popular: true,
    features: [
      "30 videos o articulos al mes",
      "3 versiones alternativas por contenido",
      "3 formatos: X, LinkedIn post y articulo",
      "Soporte prioritario",
    ],
  },
];

export function PricingSlider() {
  const [selectedIndex, setSelectedIndex] = useState(0); // Default to Gratis
  const selectedPlan = plans[selectedIndex];
  const freePlan = plans[0];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndex(parseInt(e.target.value));
  };

  const gradientPercentage = (selectedIndex / (plans.length - 1)) * 100;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Slider Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Left: Slider */}
          <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-6">
              Elige tu plan
            </h3>

            {/* Plan Labels */}
            <div className="flex justify-between mb-4 text-sm">
              {plans.map((plan, index) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`font-medium transition-colors ${
                    selectedIndex === index ? "text-primary" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {plan.name}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="relative mb-8">
              <input
                type="range"
                min="0"
                max={plans.length - 1}
                step="1"
                value={selectedIndex}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${gradientPercentage}%, #e5e7eb ${gradientPercentage}%, #e5e7eb 100%)`,
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  border: 2px solid #14b8a6;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                  cursor: pointer;
                  transition: transform 0.15s ease;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                  transform: scale(1.1);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  border: 2px solid #14b8a6;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                  cursor: pointer;
                }
              `}</style>
            </div>

            {/* Comparison with Free */}
            {selectedIndex > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 to-teal-400/10 rounded-xl p-5 border border-primary/20"
              >
                <p className="text-base font-semibold text-navy mb-4">Comparado con Gratis:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {selectedPlan.conversions - freePlan.conversions}x
                    </p>
                    <p className="text-sm text-gray-600 font-medium">mas conversiones</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {selectedPlan.regenerations - freePlan.regenerations}x
                    </p>
                    <p className="text-sm text-gray-600 font-medium">mas regeneraciones</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Selected Plan */}
          <div className="p-8 lg:p-10 bg-slate-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlan.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-navy">
                      {selectedPlan.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                  </div>
                  {selectedPlan.popular && (
                    <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {selectedPlan.originalPrice > selectedPlan.price && (
                      <span className="text-xl text-gray-400 line-through">
                        €{selectedPlan.originalPrice}
                      </span>
                    )}
                    <span className="text-5xl font-bold text-navy">€{selectedPlan.price}</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  {selectedPlan.originalPrice > selectedPlan.price && (
                    <span className="inline-block mt-2 px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                      Ahorra {Math.round((1 - selectedPlan.price / selectedPlan.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className={`flex items-center gap-3 text-gray-600 ${
                      selectedPlan.id === "pro" && feature.startsWith("30") ? "text-base" : "text-sm"
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      {selectedPlan.id === "pro" && feature.startsWith("30") ? (
                        <>
                          <span className="font-bold text-lg text-navy">30</span>
                          {feature.replace(/^30/, '')}
                        </>
                      ) : feature}
                    </li>
                  ))}
                </ul>

                {/* CTA - Always navigate to register, users start with Gratis */}
                <ParticleButton
                  href="/register"
                  className="w-full py-3 text-center"
                >
                  Empieza gratis
                  <ArrowRight className="w-4 h-4" />
                </ParticleButton>
                {selectedPlan.price > 0 && (
                  <p className="text-xs text-center text-gray-600 mt-2">
                    Podras actualizar a {selectedPlan.name} despues de registrarte
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Always visible: Free plan reminder */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Siempre puedes empezar con el plan{" "}
          <button
            onClick={() => setSelectedIndex(0)}
            className="text-primary font-medium hover:underline"
          >
            Gratis
          </button>
          {" "}— 2 conversiones al mes, sin tarjeta.
        </p>
      </div>
    </div>
  );
}
