"use client";

import Link from "next/link";

interface ErrorStateProps {
  onRetry?: () => void;
  onReset?: () => void;
}

// YouTube: No captions available
export function NoCaptionsError({ onRetry }: ErrorStateProps) {
  return (
    <div className="card text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy mb-2">
        No se encontro transcripcion
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Este video no tiene subtitulos disponibles. Solo podemos procesar videos con
        subtitulos activados (automaticos o manuales).
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary">
            Intentar con otra URL
          </button>
        )}
        <Link href="/dashboard" className="btn-primary">
          Pegar texto directamente
        </Link>
      </div>
    </div>
  );
}

// Article: Scraping failed
export function ArticleScrapingError({ onRetry }: ErrorStateProps) {
  return (
    <div className="card text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy mb-2">
        No se pudo leer el articulo
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        No pudimos extraer el contenido de este articulo. Puede estar detras de un muro
        de pago o requerir JavaScript para cargar.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary">
            Intentar otra URL
          </button>
        )}
        <Link href="/dashboard" className="btn-primary">
          Copiar y pegar texto
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Consejo: Copia el texto del articulo y pegalo en la pestana &quot;Texto&quot;
      </p>
    </div>
  );
}

// Plan limit reached
interface PlanLimitErrorProps extends ErrorStateProps {
  conversionsUsed: number;
  conversionsLimit: number;
  planName: string;
}

export function PlanLimitError({
  conversionsUsed,
  conversionsLimit,
  planName,
}: PlanLimitErrorProps) {
  return (
    <div className="card text-center py-12 border-2 border-warning/30">
      <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy mb-2">
        Has alcanzado tu limite mensual
      </h3>
      <p className="text-gray-500 mb-2">
        Has usado <span className="font-semibold text-navy">{conversionsUsed}</span> de{" "}
        <span className="font-semibold text-navy">{conversionsLimit}</span> conversiones
        de tu plan <span className="font-semibold text-primary">{planName}</span>.
      </p>
      <p className="text-gray-500 mb-6">
        Actualiza tu plan para seguir transformando contenido.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/settings" className="btn-primary">
          Mejorar mi plan
        </Link>
        <Link href="/billing" className="btn-secondary">
          Ver opciones
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Tu limite se reinicia el primer dia de cada ciclo de facturacion.
      </p>
    </div>
  );
}

// Generation error (Groq failure)
export function GenerationError({ onRetry }: ErrorStateProps) {
  return (
    <div className="card text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy mb-2">
        Error de generacion
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        No pudimos generar el contenido en este momento. Esto puede deberse a alta
        demanda del servicio.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Intentalo de nuevo
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Si el problema persiste, contacta con soporte.
      </p>
    </div>
  );
}

// Generic error state
interface GenericErrorProps extends ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
}

export function GenericError({
  title = "Algo salio mal",
  message = "Ha ocurrido un error inesperado. Por favor, intentalo de nuevo.",
  code,
  onRetry,
  onReset,
}: GenericErrorProps) {
  return (
    <div className="card text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
      {code && (
        <p className="text-xs font-mono text-gray-400 mb-4">Codigo: {code}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Intentar de nuevo
          </button>
        )}
        {onReset && (
          <button onClick={onReset} className="btn-secondary">
            Empezar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

// Rate limit error
interface RateLimitErrorProps extends ErrorStateProps {
  retryAfter?: number;
}

export function RateLimitErrorState({ retryAfter, onRetry }: RateLimitErrorProps) {
  return (
    <div className="card text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy mb-2">
        Demasiadas peticiones
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Has realizado muchas peticiones en poco tiempo.
        {retryAfter && ` Por favor, espera ${retryAfter} segundos.`}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

// Loading skeleton for results
export function ResultsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-6 w-48 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-100 rounded" />
      </div>

      {/* Mobile: single card skeleton */}
      <div className="sm:hidden">
        <div className="card">
          <div className="h-5 w-32 bg-gray-100 rounded mb-4" />
          <div className="space-y-3 mb-4">
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
          </div>
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="h-3 w-32 bg-gray-100 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-100 rounded" />
              <div className="h-8 w-32 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: three column grid skeleton */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="h-5 w-32 bg-gray-100 rounded mb-4" />
            <div className="space-y-3 mb-4">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-2/3 bg-gray-100 rounded" />
            </div>
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="h-3 w-32 bg-gray-100 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-100 rounded" />
                <div className="h-8 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline error banner (for form errors)
interface InlineErrorProps {
  message: string;
  onDismiss?: () => void;
}

export function InlineError({ message, onDismiss }: InlineErrorProps) {
  return (
    <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
      <svg
        className="w-5 h-5 text-error flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="flex-1 text-sm text-error">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-error/60 hover:text-error transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
