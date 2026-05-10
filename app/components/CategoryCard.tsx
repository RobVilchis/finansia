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

  const status = rawPct >= 100 ? "over" : rawPct >= 75 ? "warning" : "ok";

  const accent = {
    over: {
      bar: "bg-expense",
      pct: "text-expense",
      glow: "shadow-rose-500/10",
    },
    warning: {
      bar: "bg-warn",
      pct: "text-warn",
      glow: "shadow-amber-500/10",
    },
    ok: {
      bar: "bg-income",
      pct: "text-income",
      glow: "shadow-emerald-500/10",
    },
  }[status];

  if (hasBudget) {
    return (
      <Link href={`/categories/${category.id}`} className="h-full">
        <div
          className={`group relative w-full h-full rounded-xl cursor-pointer
            bg-surface backdrop-blur-md border border-edge
            hover:bg-surface-hover hover:border-edge-strong
            transition-all duration-200 overflow-hidden ${accent.glow}`}
        >
          <div className="relative flex items-center gap-4 px-4 py-3.5">
            <div className="flex-1 min-w-0 space-y-2">
              <p className="font-medium text-sm text-ink/90 truncate leading-tight">
                {category.name}
              </p>

              <div className="h-1 w-full bg-surface-strong rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${accent.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-xs font-medium text-ink-muted tabular-nums">
                  {formatMXN(spent)}
                </span>
                <span className="font-mono text-xs text-ink-faint tabular-nums">
                  {formatMXN(budget!)}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center w-14">
              <span className={`font-mono text-2xl font-semibold tabular-nums leading-none ${accent.pct}`}>
                {Math.round(rawPct)}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-widest mt-0.5 ${accent.pct} opacity-70`}>
                %
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/categories/${category.id}`} className="h-full">
      <div className="group w-full h-full rounded-xl cursor-pointer transition-all
        bg-surface backdrop-blur-md border border-edge
        hover:bg-surface-hover hover:border-edge-strong
        px-4 py-3.5 flex items-center justify-between gap-4">
        <p className="font-medium text-sm text-ink/85 truncate">
          {category.name}
        </p>
        {category.type === "expense" && spent > 0 && (
          <span className="shrink-0 font-mono text-xs tabular-nums text-ink-subtle">
            {formatMXN(spent)}
          </span>
        )}
      </div>
    </Link>
  );
}
