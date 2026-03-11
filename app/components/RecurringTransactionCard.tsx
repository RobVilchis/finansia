"use client";

import { Badge } from "@radix-ui/themes";
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
  let amountColor = "";
  if (type === "income") amountColor = "text-green-600 dark:text-green-400";
  else if (type === "expense") amountColor = "text-red-600 dark:text-red-400";
  else amountColor = "text-blue-600 dark:text-blue-400";

  return (
    <div
      className={`w-full flex flex-col py-3 px-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-none cursor-pointer hover:shadow-md dark:hover:bg-slate-700 transition-all ${!isActive ? "opacity-50" : ""
        }`}
    >
      {/* Main row: description + badges + amount */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
          <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
            {description}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="soft" color="iris" size="1">
              {FREQUENCY_LABELS[frequency as Frequency] ?? frequency}
            </Badge>
            {categoryName && (
              <Badge variant="soft" color="gray" size="1">
                {categoryName}
              </Badge>
            )}
            {!isActive && (
              <Badge variant="soft" color="orange" size="1">
                Pausada
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-lg font-bold ${amountColor}`}>
            {type === "expense" ? "-" : ""}${Number(amount).toFixed(2)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id, isActive);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            title={isActive ? "Pausar" : "Activar"}
          >
            {isActive ? (
              <Pause size={16} className="text-amber-500" />
            ) : (
              <Play size={16} className="text-green-500" />
            )}
          </button>
        </div>
      </div>

      {/* Secondary row: next date + accounts */}
      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
        <span>Próximo: {formatDate(nextRunDate)}</span>
        {sourceAccountName && <span>Origen: {sourceAccountName}</span>}
        {targetAccountName && <span>Destino: {targetAccountName}</span>}
        {endDate ? (
          <span>Hasta: {formatDate(endDate)}</span>
        ) : (
          <span>Sin fecha de fin</span>
        )}
      </div>
    </div>
  );
}
