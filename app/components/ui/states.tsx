"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { ReactNode } from "react";
import { GlassButton } from "./glass";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className={`text-center py-6 px-4 ${className}`}>
        <div className="w-9 h-9 mx-auto mb-3 rounded-full bg-surface border border-edge flex items-center justify-center text-ink-subtle">
          {icon}
        </div>
        <p className="text-sm font-medium text-ink-muted">{title}</p>
        {description && (
          <p className="text-xs text-ink-subtle mt-1 max-w-xs mx-auto">
            {description}
          </p>
        )}
        {action && <div className="mt-3 flex justify-center">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={`text-center py-16 px-6 border border-dashed border-edge rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface border border-edge flex items-center justify-center text-ink-subtle">
        {icon}
      </div>
      <p className="text-base font-medium text-ink-muted mb-1">{title}</p>
      {description && (
        <p className="text-sm text-ink-subtle max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Algo salió mal",
  message = "No se pudo cargar la información. Intenta de nuevo.",
  onRetry,
  compact = false,
  className = "",
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 bg-surface backdrop-blur-md border border-expense-border rounded-xl px-4 py-3 ${className}`}
      >
        <AlertTriangle size={16} className="text-expense shrink-0" />
        <p className="text-sm text-ink-muted flex-1">{message}</p>
        {onRetry && (
          <GlassButton
            variant="secondary"
            onClick={onRetry}
            className="px-3! py-1.5! text-xs! shrink-0 flex items-center gap-1.5"
          >
            <RotateCw size={12} />
            Reintentar
          </GlassButton>
        )}
      </div>
    );
  }

  return (
    <div
      className={`text-center py-10 px-6 bg-surface backdrop-blur-md border border-expense-border rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-expense-soft border border-expense-border flex items-center justify-center text-expense">
        <AlertTriangle size={22} />
      </div>
      <p className="text-base font-medium text-ink-muted mb-1">{title}</p>
      <p className="text-sm text-ink-subtle max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <GlassButton
            variant="secondary"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RotateCw size={14} />
            Reintentar
          </GlassButton>
        </div>
      )}
    </div>
  );
}
