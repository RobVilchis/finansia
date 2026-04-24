"use client";

import Link from "next/link";

interface Category {
  id: string;
  name: string;
  type: string;
  budget: string | null;
  spent: number;
}

interface CategoryCardProps {
  category: Category;
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const budget = category.budget ? Number(category.budget) : null;
  const spent = Number(category.spent);
  const hasBudget = category.type === "expense" && budget && budget > 0;
  const rawPct = hasBudget ? (spent / budget!) * 100 : 0;
  const clampedPct = Math.min(rawPct, 100);

  const status =
    rawPct >= 100 ? "over" : rawPct >= 75 ? "warning" : "ok";

  const accent = {
    over: {
      border: "border-l-rose-500",
      bar: "bg-rose-500",
      pct: "text-rose-500 dark:text-rose-400",
      badge: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    },
    warning: {
      border: "border-l-amber-400",
      bar: "bg-amber-400",
      pct: "text-amber-500 dark:text-amber-400",
      badge: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
    ok: {
      border: "border-l-emerald-500",
      bar: "bg-emerald-500",
      pct: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
  }[status];

  if (hasBudget) {
    return (
      <Link href={`/categories/${category.id}`} className="h-full">
        <div
          className={`group relative w-full h-full rounded-xl cursor-pointer transition-all duration-200
            border-l-4 ${accent.border}
            border border-slate-200 dark:border-white/[0.07]
            bg-white dark:bg-slate-800/70
            hover:shadow-md hover:-translate-y-px hover:bg-slate-50 dark:hover:bg-slate-800
            overflow-hidden
          `}
        >
          {/* Subtle background glow matching accent */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
            bg-linear-to-r from-white/50 dark:from-white/2 to-transparent" />

          <div className="relative flex items-center gap-4 px-4 py-3.5">
            {/* Left: name + bar + amounts */}
            <div className="flex-1 min-w-0 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm leading-tight">
                {category.name}
              </p>

              {/* Progress track */}
              <div className="h-1 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${accent.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>

              {/* Amounts */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                  {formatMXN(spent)}
                </span>
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                  {formatMXN(budget!)}
                </span>
              </div>
            </div>

            {/* Right: percentage */}
            <div className="shrink-0 flex flex-col items-center justify-center w-14">
              <span className={`font-mono text-2xl font-bold tabular-nums leading-none ${accent.pct}`}>
                {Math.round(rawPct)}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 ${accent.pct} opacity-70`}>
                %
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // No-budget card (income or expense without budget)
  return (
    <Link href={`/categories/${category.id}`} className="h-full">
      <div className="group w-full h-full rounded-xl cursor-pointer transition-all duration-200
        border border-slate-200 dark:border-white/[0.07]
        bg-white dark:bg-slate-800/70
        hover:shadow-md hover:-translate-y-px hover:bg-slate-50 dark:hover:bg-slate-800
        px-4 py-3.5 flex items-center justify-between gap-4
      ">
        <p className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
          {category.name}
        </p>
        {category.type === "expense" && spent > 0 && (
          <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {formatMXN(spent)}
          </span>
        )}
      </div>
    </Link>
  );
}
