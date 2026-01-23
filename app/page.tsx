import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <Link href="/" className="font-heading text-2xl font-bold text-navy">
          distribuia
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-navy font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors"
          >
            Prueba gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
          Para creadores en español
        </span>

        {/* Heading */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy max-w-4xl mx-auto mb-6 leading-tight">
          Convierte tus videos en posts de LinkedIn que enganchan
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          De YouTube a LinkedIn en 2 minutos. Español nativo, no traducido.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Empieza gratis
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <p className="text-sm text-gray-500">
            2 conversiones gratis. Sin tarjeta.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy text-center mb-16">
            Cómo funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-navy mb-2">
                Pega el enlace
              </h3>
              <p className="text-gray-500">
                YouTube, artículos o texto
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-navy mb-2">
                Elige el tono
              </h3>
              <p className="text-gray-500">
                Profesional, cercano o técnico
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-navy mb-2">
                Copia y publica
              </h3>
              <p className="text-gray-500">
                Posts listos para LinkedIn y X
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy text-center mb-16">
            Planes simples
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="font-heading text-lg font-semibold text-navy uppercase tracking-wide mb-4">
                Gratis
              </h3>
              <p className="text-4xl font-bold text-navy mb-1">
                €0
                <span className="text-lg font-normal text-gray-500">/mes</span>
              </p>
              <p className="text-gray-500 mb-6">Para probar</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  2 conversiones/mes
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  1 regeneración
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Todos los formatos
                </li>
              </ul>

              <Link
                href="/register"
                className="block w-full py-3 text-center rounded-lg font-semibold border border-gray-300 text-navy hover:bg-gray-50 transition-colors"
              >
                Empieza gratis
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-2xl border-2 border-primary p-8 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                Popular
              </span>

              <h3 className="font-heading text-lg font-semibold text-navy uppercase tracking-wide mb-4">
                Starter
              </h3>
              <p className="text-4xl font-bold text-navy mb-1">
                €19
                <span className="text-lg font-normal text-gray-500">/mes</span>
              </p>
              <p className="text-gray-500 mb-6">Para creadores activos</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  10 conversiones/mes
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  3 regeneraciones
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Todos los formatos
                </li>
              </ul>

              <Link
                href="/register"
                className="block w-full py-3 text-center rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors"
              >
                Elegir Starter
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl border-2 border-navy p-8">
              <h3 className="font-heading text-lg font-semibold text-navy uppercase tracking-wide mb-4">
                Pro
              </h3>
              <p className="text-4xl font-bold text-navy mb-1">
                €49
                <span className="text-lg font-normal text-gray-500">/mes</span>
              </p>
              <p className="text-gray-500 mb-6">Para profesionales</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  30 conversiones/mes
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  3 regeneraciones
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Todos los formatos
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-success flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Soporte prioritario
                </li>
              </ul>

              <Link
                href="/register"
                className="block w-full py-3 text-center rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors"
              >
                Elegir Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <p className="text-center text-sm text-gray-500">
          © 2025 Distribuia
        </p>
      </footer>
    </div>
  );
}
