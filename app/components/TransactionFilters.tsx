"use client";

import { Search, X, Calendar, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

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

function GlassSelect({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white/6 backdrop-blur-md border border-white/10
          rounded-lg px-3 py-2 pr-8 text-sm text-white/70 cursor-pointer
          hover:bg-white/10 hover:border-white/20 transition-all
          focus:outline-none focus:border-white/25
          scheme-dark"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

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
      activeFilters.endDate ||
      activeFilters.description
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
      {/* Type filter — glass pill */}
      <div className="flex gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
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
                ? "bg-white/15 text-white shadow-inner shadow-black/20"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort + toggle row */}
      <div className="flex items-center justify-between gap-2">
        <GlassSelect
          value={activeFilters.sort || "date_desc"}
          onChange={(v) => updateFilter("sort", v)}
          className="w-40"
        >
          <option value="date_desc">Más reciente</option>
          <option value="date_asc">Más antiguo</option>
          <option value="amount_desc">Mayor monto</option>
          <option value="amount_asc">Menor monto</option>
        </GlassSelect>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              <X size={13} />
              Limpiar
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
              showFilters
                ? "bg-white/10 border-white/20 text-white/80"
                : "bg-white/6 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filtros
          </button>
        </div>
      </div>

      {/* Expandable panel */}
      {showFilters && (
        <div className="space-y-2 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
          {/* Description search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por descripción..."
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
              className="w-full bg-white/6 border border-white/10 rounded-lg pl-8 pr-3 py-2
                text-sm text-white/80 placeholder:text-white/25
                focus:outline-none focus:border-white/25 hover:border-white/20 transition-all"
            />
          </div>

          {/* Category + Account */}
          <div className="grid grid-cols-2 gap-2">
            <GlassSelect
              value={activeFilters.category || "all"}
              onChange={(v) => updateFilter("category", v)}
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
              onChange={(v) => updateFilter("account", v)}
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
                <span className="text-[11px] text-white/30 ml-1">
                  {field === "startDate" ? "Desde" : "Hasta"}
                </span>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={activeFilters[field] || ""}
                    onChange={(e) => updateFilter(field, e.target.value)}
                    className="w-full h-9 pl-8 pr-2 bg-white/6 border border-white/10 rounded-lg
                      text-sm text-white/70 focus:outline-none focus:border-white/25
                      hover:border-white/20 transition-all scheme-dark"
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
