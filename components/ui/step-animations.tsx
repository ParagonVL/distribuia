"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Animation 1: Pega el enlace - URL input animation
// Sequence: cursor moves to field → clicks → types URL → cursor moves to button → clicks
export function PegaEnlaceAnimation() {
  const [step, setStep] = useState(0);
  const url = "youtube.com/watch?v=abc123";

  useEffect(() => {
    const steps = [
      { delay: 800 },   // Step 0: Cursor moves to input field
      { delay: 600 },   // Step 1: Click on input (shows click effect)
      { delay: 1800 },  // Step 2: Type URL
      { delay: 800 },   // Step 3: Cursor moves to button
      { delay: 600 },   // Step 4: Click button
      { delay: 1500 },  // Step 5: Reset
    ];

    const timeout = setTimeout(() => {
      setStep((prev) => (prev + 1) % 6);
    }, steps[step].delay);

    return () => clearTimeout(timeout);
  }, [step]);

  const isFieldFocused = step >= 1 && step <= 2;
  const isTyping = step === 2;
  const isButtonClicked = step === 4;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        {/* Input field */}
        <div className="relative mb-3">
          <div
            className={`w-full h-12 rounded-lg border-2 transition-colors flex items-center px-3 ${
              isFieldFocused ? "border-primary bg-primary/5" : "border-gray-200"
            }`}
          >
            <div className="w-5 h-5 rounded bg-red-500 mr-2 flex-shrink-0" />
            <div className="flex-1 font-mono text-sm text-gray-600 overflow-hidden">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: step >= 2 ? "100%" : 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                {url}
              </motion.span>
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                />
              )}
            </div>
          </div>

          {/* Cursor moving to input field */}
          <AnimatePresence>
            {step === 0 && (
              <motion.div
                initial={{ x: 120, y: 60, opacity: 0 }}
                animate={{ x: 80, y: 20, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute pointer-events-none"
              >
                <CursorIcon />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cursor clicking input field */}
          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 1, x: 80, y: 20 }}
                animate={{ opacity: 1, x: 80, y: 20 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none"
              >
                <CursorClickIcon />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Convert button */}
        <motion.div
          animate={{
            scale: isButtonClicked ? 0.95 : 1,
            backgroundColor: isButtonClicked ? "#0d9488" : "#14b8a6",
          }}
          className="w-full h-10 rounded-lg bg-primary flex items-center justify-center relative"
        >
          <span className="text-white font-semibold text-sm">Convertir</span>

          {/* Cursor moving to button */}
          <AnimatePresence>
            {step === 3 && (
              <motion.div
                initial={{ x: -60, y: -40, opacity: 0 }}
                animate={{ x: 20, y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute pointer-events-none"
              >
                <CursorIcon />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cursor clicking button */}
          <AnimatePresence>
            {step === 4 && (
              <motion.div
                initial={{ opacity: 1, x: 20, y: 0 }}
                animate={{ opacity: 1, x: 20, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none"
              >
                <CursorClickIcon />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// Animation 2: Elige el tono - Tone selection animation
export function EligeTonoAnimation() {
  const [selected, setSelected] = useState(0);
  const tones = ["Profesional", "Cercano", "Tecnico"];

  useEffect(() => {
    const interval = setInterval(() => {
      setSelected((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-sm text-gray-600 mb-3 text-center">Selecciona el tono</div>
        <div className="flex gap-2 justify-center">
          {tones.map((tone, index) => (
            <motion.button
              key={tone}
              animate={{
                scale: selected === index ? 1.05 : 1,
                backgroundColor: selected === index ? "#14b8a6" : "#f3f4f6",
              }}
              transition={{ duration: 0.3 }}
              className="px-4 py-2.5 rounded-full text-sm font-medium"
              style={{
                color: selected === index ? "white" : "#4b5563",
              }}
            >
              {tone}
            </motion.button>
          ))}
        </div>

        {/* Visual indicator */}
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <CheckIcon />
            </motion.div>
            <span className="text-sm text-gray-600">
              Tono {tones[selected].toLowerCase()} seleccionado
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Animation 3: Copia y publica - Copy and publish animation
export function CopiaPublicaAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Generated post preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-blue-600" />
            <span className="text-xs text-gray-600">LinkedIn</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-gray-200 rounded w-full" />
            <div className="h-2.5 bg-gray-200 rounded w-5/6" />
            <div className="h-2.5 bg-gray-200 rounded w-4/6" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.div
            animate={{
              scale: step === 1 ? 0.95 : 1,
              backgroundColor: step === 1 ? "#0d9488" : "#14b8a6",
            }}
            className="flex-1 h-10 rounded-lg bg-primary flex items-center justify-center gap-2"
          >
            <CopyIcon />
            <span className="text-white text-sm font-medium">
              {step === 2 ? "Copiado!" : "Copiar"}
            </span>
          </motion.div>
          <motion.div
            animate={{ scale: step === 3 ? 0.95 : 1 }}
            className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <RefreshIcon />
          </motion.div>
        </div>

        {/* Copied notification */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
            >
              Copiado al portapapeles
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Animation 4: Español nativo - Language comparison animation
export function EspanolNativoAnimation() {
  const [showNative, setShowNative] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNative((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {!showNative ? (
            <motion.div
              key="translated"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-red-400" />
                <span className="text-xs text-red-500 font-medium">Traducido</span>
              </div>
              <p className="text-sm text-gray-600 italic">
                &quot;Estoy muy emocionado de compartir que he estado trabajando en...&quot;
              </p>
              <div className="mt-2 text-xs text-red-400">Suena robotico</div>
            </motion.div>
          ) : (
            <motion.div
              key="native"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl border-2 border-primary shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span className="text-xs text-primary font-medium">Espanol nativo</span>
              </div>
              <p className="text-sm text-navy">
                &quot;Llevo semanas dandole vueltas a esto y al fin puedo contaroslo...&quot;
              </p>
              <div className="mt-2 text-xs text-primary">Natural y cercano</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle indicator */}
        <div className="flex justify-center mt-4 gap-2">
          <motion.div
            animate={{ backgroundColor: !showNative ? "#14b8a6" : "#e5e7eb" }}
            className="w-2 h-2 rounded-full"
          />
          <motion.div
            animate={{ backgroundColor: showNative ? "#14b8a6" : "#e5e7eb" }}
            className="w-2 h-2 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

// Icons
function CursorIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
      <path d="M5 2L19 12L12 13L9 20L5 2Z" fill="white" stroke="#1E2A4A" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function CursorClickIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
      <path d="M5 2L19 12L12 13L9 20L5 2Z" fill="#14b8a6" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
