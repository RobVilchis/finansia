"use client";

import { Search, X, Calendar, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { GlassSelect } from "@/app/components/ui/glass";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
}

export interface ActiveFilters {
  type?: string;
  category?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  sort?: string;
}

const TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "expense", label: "Gastos" },
  { value: "income", label: "Ingresos" },
  { value: "transfer", label: "Transferencias" },
];

export default function TransactionFilters({
  categories,
  accounts,
  activeFilters,
}: {
  categories: Category[];
  accounts: Account[];
  activeFilters: ActiveFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [descriptionInput, setDescriptionInput] = useState(
    activeFilters.description || ""
  );
  const [showFilters, setShowFilters] = useState(
    !!(
      activeFilters.category ||
      activeFilters.account ||
      activeFilters.startDate ||
      activeFilters.endDate
    )
  );

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    const tab = searchParams.get("tab");
    if (tab) params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setDescriptionInput("");
  }, [searchParams, router]);

  const hasActiveFilters =
    activeFilters.type ||
    activeFilters.category ||
    activeFilters.account ||
    activeFilters.startDate ||
    activeFilters.endDate ||
    activeFilters.description;

  const filteredCategories = activeFilters.type
    ? categories.filter((cat) => cat.type === activeFilters.type)
    : categories;

  return (
    <div className="mb-4 space-y-2">
      {/* Row 1 — Type filter pills */}
      <div className="flex gap-1 bg-surface backdrop-blur-md border border-edge rounded-xl p-1">
        {TYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              if (value !== "all" && activeFilters.category) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("category");
                params.delete("page");
                params.set("type", value);
                router.push(`?${params.toString()}`);
              } else {
                updateFilter("type", value);
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              (activeFilters.type || "all") === value
                ? "bg-surface-strong text-ink shadow-inner shadow-black/20"
                : "text-ink-faint hover:text-ink-muted hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Row 2 — Search + sort + controls */}
      <div className="flex items-center gap-2">
        {/* Description search — always visible */}
        <div className="relative flex-1 min-w-0">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilter("description", descriptionInput);
            }}
            onBlur={() => {
              if (descriptionInput !== (activeFilters.description || "")) {
                updateFilter("description", descriptionInput);
              }
            }}
            className="w-full h-9 bg-surface border border-edge rounded-lg pl-8 pr-3
              text-sm text-ink-muted placeholder:text-ink-faint
              focus:outline-none focus:border-accent-border hover:border-edge-strong transition-all"
          />
        </div>

        {/* Sort */}
        <div className="w-36 shrink-0">
          <GlassSelect
            value={activeFilters.sort || "date_desc"}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="date_desc">Más reciente</option>
            <option value="date_asc">Más antiguo</option>
            <option value="amount_desc">Mayor monto</option>
            <option value="amount_asc">Menor monto</option>
          </GlassSelect>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs text-ink-faint hover:text-ink-muted transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
            showFilters
              ? "bg-surface-strong border-edge-strong text-ink-muted"
              : "bg-surface border-edge text-ink-subtle hover:bg-surface-strong hover:text-ink-muted"
          }`}
        >
          <SlidersHorizontal size={13} />
          Filtros
        </button>
      </div>

      {/* Expandable panel — category, account, dates */}
      {showFilters && (
        <div className="space-y-2 p-3 bg-surface backdrop-blur-md border border-edge rounded-xl">
          {/* Category + Account */}
          <div className="grid grid-cols-2 gap-2">
            <GlassSelect
              value={activeFilters.category || "all"}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="all">Categoría</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </GlassSelect>

            <GlassSelect
              value={activeFilters.account || "all"}
              onChange={(e) => updateFilter("account", e.target.value)}
            >
              <option value="all">Cuenta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.name}>
                  {account.name}
                </option>
              ))}
            </GlassSelect>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            {(["startDate", "endDate"] as const).map((field) => (
              <label key={field} className="space-y-1">
                <span className="text-[11px] text-ink-faint ml-1">
                  {field === "startDate" ? "Desde" : "Hasta"}
                </span>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none z-10" />
                  <input
                    type="date"
                    value={activeFilters[field] || ""}
                    onChange={(e) => updateFilter(field, e.target.value)}
                    className="w-full h-9 pl-8 pr-2 bg-surface border border-edge rounded-lg
                      text-sm text-ink-muted focus:outline-none focus:border-accent-border
                      hover:border-edge-strong transition-all scheme-dark"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
