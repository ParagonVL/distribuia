"use client";

import { useEffect, useState, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "warning";
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast["type"]) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

// Simple toast store for global access
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

function addToast(message: string, type: Toast["type"] = "error") {
  const id = Math.random().toString(36).substring(2, 9);
  toasts = [...toasts, { id, message, type }];
  notifyListeners();

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

// Export functions for use anywhere in the app
export const toast: ToastContextValue = {
  showToast: (message: string, type: Toast["type"] = "error") => addToast(message, type),
  showError: (message: string) => addToast(message, "error"),
  showSuccess: (message: string) => addToast(message, "success"),
};

// Individual toast component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  const bgColor = {
    error: "bg-error",
    success: "bg-success",
    warning: "bg-warning",
  }[toast.type];

  const borderColor = {
    error: "border-error",
    success: "border-success",
    warning: "border-warning",
  }[toast.type];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4
        bg-white ${borderColor}
        transform transition-all duration-200 ease-out
        ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-5 h-5 ${bgColor} rounded-full flex items-center justify-center`}>
        {toast.type === "error" && (
          <svg aria-hidden="true" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {toast.type === "success" && (
          <svg aria-hidden="true" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === "warning" && (
          <svg aria-hidden="true" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
          </svg>
        )}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-navy">{toast.message}</p>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Toast container component - add this to your layout
export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setCurrentToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {currentToasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  );
}

// Hook for components that need toast functionality
export function useToast() {
  return toast;
}
