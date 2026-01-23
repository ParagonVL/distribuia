"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} border-primary/20 border-t-primary rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

export function LoadingSpinnerCentered({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size={size} />
    </div>
  );
}
