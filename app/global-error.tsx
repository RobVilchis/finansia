"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-app">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center py-10 px-6 bg-surface backdrop-blur-md border border-expense-border rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-expense-soft border border-expense-border flex items-center justify-center text-expense">
              <AlertTriangle size={22} />
            </div>
            <p className="text-base font-medium text-ink-muted mb-1">
              Algo salió mal
            </p>
            <p className="text-sm text-ink-subtle max-w-sm mx-auto">
              Ocurrió un error inesperado. Si el problema persiste, vuelve a
              intentarlo más tarde.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-surface border border-edge text-ink-muted hover:bg-surface-strong hover:text-ink hover:border-edge-strong flex items-center gap-2"
              >
                <RotateCw size={14} />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
