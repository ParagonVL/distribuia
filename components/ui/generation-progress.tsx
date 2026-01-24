"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressRing } from "./progress-ring";

// Format to step mapping
const FORMAT_TO_STEP: Record<string, number> = {
  x_thread: 1,
  linkedin_post: 2,
  linkedin_article: 3,
};

// Base steps configuration
const BASE_STEPS = [
  {
    id: 1,
    format: "x_thread",
    label: "Generando hilo de X",
    shortLabel: "Hilo de X",
    targetPercent: 40,
  },
  {
    id: 2,
    format: "linkedin_post",
    label: "Creando post de LinkedIn",
    shortLabel: "Post",
    targetPercent: 70,
  },
  {
    id: 3,
    format: "linkedin_article",
    label: "Escribiendo articulo",
    shortLabel: "Articulo",
    targetPercent: 100,
  },
];

// Get steps with dynamic first step based on input type
const getSteps = (inputType: "youtube" | "article" | "text") => [
  {
    id: 0,
    format: "extract",
    label: inputTypeLabels[inputType],
    shortLabel: "Extraer",
    targetPercent: 10,
  },
  ...BASE_STEPS,
];

// Icons for each step
const StepIcon = ({ stepId, isActive, isComplete }: { stepId: number; isActive: boolean; isComplete: boolean }) => {
  const iconClass = `w-5 h-5 ${isComplete ? "text-white" : isActive ? "text-primary" : "text-gray-400"}`;

  const icons = [
    // Download/Extract icon
    <svg key="extract" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>,
    // X/Twitter icon
    <svg key="twitter" className={iconClass} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>,
    // LinkedIn icon
    <svg key="linkedin" className={iconClass} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>,
    // Document/Article icon
    <svg key="article" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>,
  ];

  return icons[stepId] || icons[0];
};

interface GenerationProgressProps {
  inputType?: "youtube" | "article" | "text";
  completedFormats?: string[]; // Real-time completed formats from polling
}

// First step label based on input type
const inputTypeLabels = {
  youtube: "Extrayendo transcripcion",
  article: "Leyendo articulo",
  text: "Procesando texto",
};

export function GenerationProgress({ inputType = "youtube", completedFormats = [] }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [useRealProgress, setUseRealProgress] = useState(false);

  // Get steps based on input type
  const steps = getSteps(inputType);

  // Determine real progress from completed formats
  useEffect(() => {
    if (completedFormats.length > 0) {
      setUseRealProgress(true);

      // Find the highest completed step
      let maxCompletedStep = 0;
      for (const format of completedFormats) {
        const stepId = FORMAT_TO_STEP[format];
        if (stepId && stepId > maxCompletedStep) {
          maxCompletedStep = stepId;
        }
      }

      // Set current step to next one being processed
      const nextStep = Math.min(maxCompletedStep + 1, steps.length - 1);
      setCurrentStep(nextStep);

      // Calculate real progress based on completed formats
      // Extract (10%) + each format (30% each)
      const baseProgress = 10; // Extract step always done if we have any outputs
      const formatProgress = completedFormats.length * 30;
      setProgress(Math.min(baseProgress + formatProgress, 99));
    }
  }, [completedFormats, steps.length]);

  // Simulated progress when no real data (initial extraction phase)
  useEffect(() => {
    if (useRealProgress) return; // Skip simulation if we have real data

    // Only simulate for first 10 seconds (extraction phase)
    const simulationDuration = 10000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed > simulationDuration) {
        // After extraction, wait for real progress
        setCurrentStep(1); // Move to first generation step
        setProgress(10);
        clearInterval(interval);
        return;
      }

      // Simulate extraction progress (0-10%)
      const extractProgress = Math.min((elapsed / simulationDuration) * 10, 10);
      setProgress(extractProgress);
      setCurrentStep(0);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, useRealProgress]);

  return (
    <div className="relative flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-gradient-to-b from-slate-100 to-slate-50 border border-slate-200 shadow-lg">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden rounded-xl">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(20 184 166 / 0.2) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
      </div>
      {/* Animated glow behind progress ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Main progress ring */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <ProgressRing progress={progress} size={160} strokeWidth={12} />
      </motion.div>

      {/* Current step label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-lg font-medium text-navy">{steps[currentStep].label}...</p>
          {completedFormats.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {completedFormats.length} de 3 formatos completados
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Step indicators */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {steps.map((step, index) => {
          // Determine if step is complete based on real data or position
          const isComplete = useRealProgress
            ? (step.format === "extract" || completedFormats.includes(step.format))
            : index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step dot/icon */}
              <motion.div
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  ${isComplete ? "bg-primary" : isActive ? "bg-primary/10 ring-2 ring-primary" : "bg-gray-100"}
                  transition-colors duration-300
                `}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              >
                <StepIcon stepId={index} isActive={isActive} isComplete={isComplete} />

                {/* Checkmark for completed */}
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Active spinner */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 mx-1">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isComplete ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ originX: 0 }}
                  />
                  <div className="h-full bg-gray-200 -mt-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels (mobile hidden) */}
      <div className="hidden sm:flex mt-2 justify-center gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <span
              className={`text-xs w-10 text-center ${
                index <= currentStep ? "text-navy" : "text-gray-400"
              }`}
            >
              {step.shortLabel}
            </span>
            {index < steps.length - 1 && <div className="w-8 mx-1" />}
          </div>
        ))}
      </div>

      {/* Time estimate - updated message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-sm text-gray-600"
      >
        {useRealProgress
          ? "Generando contenido en segundo plano..."
          : "Procesando contenido..."}
      </motion.p>

      {/* Safe to navigate notice */}
      {useRealProgress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Puedes navegar - tu contenido se genera en segundo plano</span>
        </motion.div>
      )}

      {/* Subtle loading bar at bottom */}
      <div className="w-full max-w-xs mt-6 h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary-dark"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
