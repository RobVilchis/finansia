"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorState } from "@/app/components/ui/states";

export default function MainError({
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
    <div className="min-h-[60vh] flex items-center justify-center px-6 font-(family-name:--font-outfit)">
      <ErrorState
        title="Algo salió mal"
        message="Ocurrió un error al cargar esta página. Si el problema persiste, vuelve a intentarlo más tarde."
        onRetry={reset}
        className="w-full max-w-md"
      />
    </div>
  );
}
