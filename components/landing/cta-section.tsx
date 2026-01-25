"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackgroundPaths } from "./background-paths";

// Pulsating word component for "conecta"
function PulsatingWord({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block text-error"
      animate={{
        scale: [1, 1.05, 1],
        textShadow: [
          "0 0 0px rgba(239, 68, 68, 0)",
          "0 0 20px rgba(239, 68, 68, 0.5)",
          "0 0 0px rgba(239, 68, 68, 0)",
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

export function CTASection() {
  // Split title to handle "conecta" separately
  const titleStart = "Empieza a crear contenido que ";
  const highlightWord = "conecta";

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32 px-4 sm:px-6">
      {/* Animated SVG paths background */}
      <BackgroundPaths />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Animated heading - letter by letter with pulsating conecta */}
        <motion.h2
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-navy mb-8 leading-tight"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {titleStart.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.03,
                type: "spring",
                stiffness: 100,
                damping: 12,
              }}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : "normal" }}
            >
              {char}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: titleStart.length * 0.03,
              type: "spring",
              stiffness: 100,
              damping: 12,
            }}
          >
            <PulsatingWord>{highlightWord}</PulsatingWord>
          </motion.span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Transforma cualquier video de YouTube en contenido listo para publicar.
          En espanol nativo, no traducido.
        </motion.p>

        {/* CTA Button with glow effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="relative inline-block"
        >
          {/* Glow effect behind button */}
          <motion.div
            className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-teal-400 hover:from-primary-dark hover:to-teal-500 text-white font-bold text-lg sm:text-xl px-10 sm:px-14 py-5 sm:py-6 rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300"
            >
              Empieza gratis
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Sin tarjeta de credito</span>
          </div>
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Primeras conversiones gratis</span>
          </div>
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Cancela cuando quieras</span>
          </div>
        </motion.div>

        {/* Social proof with animation */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-2 text-gray-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <motion.span
            className="inline-block w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span>+500 creadores ya usan Distribuia</span>
        </motion.div>
      </div>
    </section>
  );
}
