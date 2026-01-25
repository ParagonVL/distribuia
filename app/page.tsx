"use client";

import Link from "next/link";
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { ParticleButton } from "@/components/ui/particle-button";
import { FeaturesCarousel } from "@/components/ui/features-carousel";
import { PricingSlider } from "@/components/ui/pricing-slider";
import { CTASection } from "@/components/landing/cta-section";
import { PulsatingWord } from "@/components/ui/animated-word";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Beams */}
      <BackgroundBeams className="bg-gradient-to-b from-slate-50 to-background !min-h-0">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center justify-center h-full overflow-hidden">
            <Image
              src="/logo.png"
              alt="Distribuia"
              width={360}
              height={240}
              className="w-[360px] h-auto -mt-10 -mb-14 object-contain object-left"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-navy font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Iniciar sesion
            </Link>
            <ParticleButton href="/register" className="px-4 py-2">
              Prueba gratis
            </ParticleButton>
          </div>
        </nav>

        {/* Hero Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary text-sm font-medium rounded-full mb-6">
            Para creadores en espanol
          </span>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy max-w-4xl mx-auto mb-6 leading-tight">
            Convierte tus videos en posts de LinkedIn que{" "}
            <PulsatingWord className="text-primary">enganchan</PulsatingWord>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            De YouTube a LinkedIn en 2 minutos. Espanol nativo, no traducido.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <ParticleButton
              href="/register"
              className="px-8 py-4 text-lg"
            >
              Empieza gratis
              <ArrowRight className="w-5 h-5" />
            </ParticleButton>
            <p className="text-sm text-gray-600">
              Primeras conversiones gratis. Sin tarjeta.
            </p>
          </div>

          {/* Scroll indicator - centered */}
          <div className="flex justify-center">
            <ScrollIndicator />
          </div>
        </section>
      </BackgroundBeams>

      {/* How it works - Features Carousel */}
      <section id="como-funciona" className="bg-gradient-to-br from-navy via-navy to-slate-800 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-sm font-medium rounded-full mb-4">
              Simple y rapido
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Como funciona
            </h2>
          </div>
          <FeaturesCarousel />
        </div>
      </section>

      {/* Pricing Section with Slider */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary text-sm font-medium rounded-full mb-4">
              Precios simples
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
              Elige tu plan
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Empieza gratis y escala cuando lo necesites. Sin compromisos.
            </p>
          </div>
          <PricingSlider />
        </div>
      </section>

      {/* Final CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
            <p className="text-sm text-gray-600">
              © 2026 Distribuia
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/privacidad" className="hover:text-primary transition-colors">
                Privacidad
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/terminos" className="hover:text-primary transition-colors">
                Terminos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
