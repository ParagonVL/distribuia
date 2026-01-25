"use client";

import { Zap, Target, BarChart3, Globe } from "lucide-react";

const highlights = [
  {
    icon: Zap,
    title: "Rapido",
    description: "De video a post en menos de 2 minutos.",
  },
  {
    icon: Target,
    title: "Preciso",
    description: "Extrae las ideas clave automaticamente.",
  },
  {
    icon: BarChart3,
    title: "Efectivo",
    description: "Posts optimizados para engagement.",
  },
  {
    icon: Globe,
    title: "Nativo",
    description: "Español real, no traducido de ingles.",
  },
];

export function DemoSection() {
  return (
    <section className="overflow-hidden py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Resultados reales
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
            Mira como funciona
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Transforma cualquier video de YouTube en contenido profesional para tus redes sociales en cuestion de segundos.
          </p>
        </div>

        {/* 3D Image showcase */}
        <div className="relative -mx-4 sm:-mx-8 lg:-mx-12">
          <div className="[perspective:1200px]">
            <div className="[transform:rotateX(8deg)_rotateY(-2deg)_skewY(-1deg)] transition-transform duration-500 hover:[transform:rotateX(4deg)_rotateY(-1deg)_skewY(0deg)]">
              <div className="relative aspect-[16/9] max-w-4xl mx-auto">
                {/* Gradient overlay */}
                <div className="absolute -inset-8 bg-gradient-radial from-transparent via-transparent to-background/80 z-10 pointer-events-none" />

                {/* Main mockup */}
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white rounded-md px-3 py-1 text-sm text-gray-400 border border-gray-200 max-w-md">
                        distribuia.com/dashboard
                      </div>
                    </div>
                  </div>

                  {/* App content mockup */}
                  <div className="p-6 sm:p-8 bg-slate-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Input side */}
                      <div className="space-y-4">
                        <div className="h-4 w-32 bg-gray-300 rounded" />
                        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                          <div className="h-10 bg-gray-100 rounded-lg flex items-center px-3">
                            <div className="w-4 h-4 bg-red-400 rounded mr-2" />
                            <div className="h-3 w-48 bg-gray-200 rounded" />
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 w-20 bg-primary/20 rounded-full" />
                            <div className="h-8 w-20 bg-gray-100 rounded-full" />
                          </div>
                          <div className="h-10 bg-primary rounded-lg" />
                        </div>
                      </div>

                      {/* Output side */}
                      <div className="space-y-4">
                        <div className="h-4 w-24 bg-gray-300 rounded" />
                        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-blue-500 rounded" />
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-full bg-gray-200 rounded" />
                            <div className="h-3 w-5/6 bg-gray-200 rounded" />
                            <div className="h-3 w-4/6 bg-gray-200 rounded" />
                            <div className="h-3 w-full bg-gray-200 rounded" />
                            <div className="h-3 w-3/4 bg-gray-200 rounded" />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <div className="h-8 w-20 bg-primary rounded-lg" />
                            <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative shadow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/10 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pt-8">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-heading text-sm font-semibold text-navy">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
