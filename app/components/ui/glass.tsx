"use client";

import { ChevronDown } from "lucide-react";
import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: ReactNode;
};

export const GlassInput = forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon, className = "", ...props }, ref) => (
    <div className="relative">
      {leadingIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-faint z-10">
          {leadingIcon}
        </div>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full h-10 ${leadingIcon ? "pl-10" : "pl-3"} pr-3
          bg-surface backdrop-blur-md border border-edge rounded-lg
          text-sm text-ink placeholder:text-ink-faint
          focus:outline-none focus:border-accent-border focus:bg-surface-strong
          hover:border-edge-strong transition-all scheme-dark ${className}`}
      />
    </div>
  )
);
GlassInput.displayName = "GlassInput";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const GlassTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={`w-full bg-surface backdrop-blur-md border border-edge rounded-lg
        px-3 py-2 text-sm text-ink placeholder:text-ink-faint
        focus:outline-none focus:border-accent-border focus:bg-surface-strong
        hover:border-edge-strong transition-all resize-none ${className}`}
    />
  )
);
GlassTextarea.displayName = "GlassTextarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  leadingIcon?: ReactNode;
};

export const GlassSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, leadingIcon, className = "", ...props }, ref) => (
    <div className="relative">
      {leadingIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-faint z-10">
          {leadingIcon}
        </div>
      )}
      <select
        ref={ref}
        {...props}
        className={`w-full h-10 appearance-none
          ${leadingIcon ? "pl-10" : "pl-3"} pr-8
          bg-surface backdrop-blur-md border border-edge rounded-lg
          text-sm text-ink-muted cursor-pointer
          focus:outline-none focus:border-accent-border
          hover:border-edge-strong hover:bg-surface-strong
          transition-all scheme-dark ${className}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
    </div>
  )
);
GlassSelect.displayName = "GlassSelect";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-soft border border-accent-border text-accent-fg hover:bg-accent/30 hover:text-cyan-100 hover:border-cyan-400/50",
  secondary:
    "bg-surface border border-edge text-ink-muted hover:bg-surface-strong hover:text-ink hover:border-edge-strong",
  danger:
    "bg-expense-soft border border-expense-border text-rose-300 hover:bg-rose-500/25 hover:text-rose-200 hover:border-rose-400/40",
  ghost:
    "bg-transparent border border-transparent text-ink-subtle hover:bg-surface hover:text-ink-muted",
};

export function GlassButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: GlassButtonProps) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg text-sm font-medium
        transition-all cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  accent?: string;
}

export function GlassSegmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
}) {
  return (
    <div className="flex gap-1 bg-surface backdrop-blur-md border border-edge rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg
            text-xs font-medium transition-all duration-200 cursor-pointer ${
              value === opt.value
                ? "bg-surface-strong text-ink shadow-inner shadow-black/20"
                : "text-ink-subtle hover:text-ink-muted hover:bg-surface"
            }`}
        >
          {opt.icon && (
            <span className={value === opt.value ? opt.accent ?? "" : "text-ink-subtle"}>
              {opt.icon}
            </span>
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider mb-1.5 block">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-expense mt-1">{message}</p>;
}

export function GlassDialogShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="font-(family-name:--font-outfit)">
      <div className="px-6 pt-5 pb-4 border-b border-edge-soft">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-full bg-surface border border-edge flex items-center justify-center text-accent">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold text-ink leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export const glassDialogContent =
  "z-40! p-0! rounded-2xl! bg-app/95! backdrop-blur-xl! border! border-edge! shadow-2xl! shadow-black/60!";

export function GlassCard({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`bg-surface backdrop-blur-md border border-edge rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-medium text-ink-subtle uppercase tracking-widest">
      {children}
    </h2>
  );
}
