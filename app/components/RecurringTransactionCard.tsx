"use client";

import { Pause, Play } from "lucide-react";
import { FREQUENCY_LABELS, type Frequency } from "@/lib/db/schema/recurringTransactions";

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  categoryName: string | null;
  sourceAccountName: string | null;
  targetAccountName: string | null;
}

interface RecurringTransactionCardProps extends RecurringTransaction {
  onToggle: (id: string, currentActive: boolean) => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "warn";
}) {
  const styles =
    tone === "accent"
      ? "bg-accent-soft border-accent-border text-accent-fg"
      : tone === "warn"
        ? "bg-warn-soft border-warn-border text-warn"
        : "bg-surface border-edge text-ink-subtle";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${styles}`}
    >
      {children}
    </span>
  );
}

export default function RecurringTransactionCard({
  id,
  description,
  amount,
  type,
  frequency,
  nextRunDate,
  endDate,
  isActive,
  categoryName,
  sourceAccountName,
  targetAccountName,
  onToggle,
}: RecurringTransactionCardProps) {
  let amountColor = "text-transfer";
  if (type === "income") amountColor = "text-income";
  else if (type === "expense") amountColor = "text-expense";

  return (
    <div
      className={`w-full flex flex-col py-3 px-4 rounded-xl
        bg-surface backdrop-blur-md border border-edge-soft
        cursor-pointer hover:bg-surface-hover hover:border-edge
        transition-all duration-200 shadow-lg shadow-black/10
        ${!isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 min-w-0 flex-1">
          <h3 className="text-sm font-medium text-ink/90 line-clamp-1">
            {description}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge tone="accent">
              {FREQUENCY_LABELS[frequency as Frequency] ?? frequency}
            </Badge>
            {categoryName && <Badge>{categoryName}</Badge>}
            {!isActive && <Badge tone="warn">Pausada</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-base font-semibold font-mono tabular-nums ${amountColor}`}
          >
            {type === "expense" ? "-" : ""}
            {formatMXN(Number(amount))}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id, isActive);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-strong transition-colors cursor-pointer"
            title={isActive ? "Pausar" : "Activar"}
          >
            {isActive ? (
              <Pause size={16} className="text-warn" />
            ) : (
              <Play size={16} className="text-income" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-faint flex-wrap">
        <span>Próximo: {formatDate(nextRunDate)}</span>
        {sourceAccountName && <span>· Origen: {sourceAccountName}</span>}
        {targetAccountName && <span>· Destino: {targetAccountName}</span>}
        {endDate ? (
          <span>· Hasta: {formatDate(endDate)}</span>
        ) : (
          <span>· Sin fecha de fin</span>
        )}
      </div>
    </div>
  );
}
