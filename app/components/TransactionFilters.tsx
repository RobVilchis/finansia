"use client";

import { Select, TextField, Button, SegmentedControl, Flex } from "@radix-ui/themes";
import { Search, X, Calendar, SlidersHorizontal } from "lucide-react";
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

      // Reset to page 1 when filters change
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
    <div className="mb-4 space-y-3">
      {/* Type Filter */}
      <SegmentedControl.Root
        value={activeFilters.type || "all"}
        onValueChange={(value) => {
          // Clear category when type changes since categories are type-specific
          if (activeFilters.category) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("category");
            params.delete("page");
            if (value === "all") {
              params.delete("type");
            } else {
              params.set("type", value);
            }
            router.push(`?${params.toString()}`);
          } else {
            updateFilter("type", value);
          }
        }}
        size="2"
      >
        <SegmentedControl.Item value="all">Todos</SegmentedControl.Item>
        <SegmentedControl.Item value="expense">Gastos</SegmentedControl.Item>
        <SegmentedControl.Item value="income">Ingresos</SegmentedControl.Item>
        <SegmentedControl.Item value="transfer">
          Transferencias
        </SegmentedControl.Item>
      </SegmentedControl.Root>

      {/* Sort + Toggle Filters Row */}
      <Flex justify="between" align="center" gap="2">
        <Select.Root
          value={activeFilters.sort || "date_desc"}
          onValueChange={(value) => updateFilter("sort", value)}
          size="2"

        >
          <Select.Trigger variant="soft"
            className="text-slate-600! dark:text-slate-300! bg-slate-150! dark:bg-slate-800! font-normal!"
          />
          <Select.Content
          >
            <Select.Item value="date_desc">Más reciente</Select.Item>
            <Select.Item value="date_asc">Más antiguo</Select.Item>
            <Select.Item value="amount_desc">Mayor monto</Select.Item>
            <Select.Item value="amount_asc">Menor monto</Select.Item>
          </Select.Content>
        </Select.Root>

        <Flex gap="3" align="center">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="2"
              onClick={clearAllFilters}
              className="text-slate-500! hover:text-slate-700! dark:hover:text-slate-300! cursor-pointer! opacity-80  "
            >
              <X size={14} />
              Limpiar
            </Button>
          )}
          <Button
            variant="soft"
            size="2"
            onClick={() => setShowFilters(!showFilters)}
            className="cursor-pointer! text-slate-600! dark:text-slate-300! bg-slate-150! dark:bg-slate-800! font-normal!"
          >
            <SlidersHorizontal size={14} />
            Filtros
          </Button>
        </Flex>
      </Flex>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          {/* Description Search */}
          <TextField.Root
            size="2"
            placeholder="Buscar por descripción..."
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("description", descriptionInput);
              }
            }}
            onBlur={() => {
              if (descriptionInput !== (activeFilters.description || "")) {
                updateFilter("description", descriptionInput);
              }
            }}
          >
            <TextField.Slot>
              <Search size={14} className="text-slate-400" />
            </TextField.Slot>
          </TextField.Root>

          {/* Category + Account Row */}
          <div className="grid grid-cols-2 gap-2">
            <Select.Root
              value={activeFilters.category || "all"}
              onValueChange={(value) => updateFilter("category", value)}
              size="2"
            >
              <Select.Trigger
                placeholder="Categoria"
                className="w-full!"
                variant="surface"
              />
              <Select.Content>
                <Select.Item value="all">Todas las categorías</Select.Item>
                {filteredCategories.map((cat) => (
                  <Select.Item key={cat.id} value={cat.name}>
                    {cat.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root
              value={activeFilters.account || "all"}
              onValueChange={(value) => updateFilter("account", value)}
              size="2"
            >
              <Select.Trigger
                placeholder="Cuenta"
                className="w-full!"
                variant="surface"
              />
              <Select.Content>
                <Select.Item value="all">Todas las cuentas</Select.Item>
                {accounts.map((account) => (
                  <Select.Item key={account.id} value={account.name}>
                    {account.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <span className="ml-1">Desde</span>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Calendar size={14} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  className="h-8 w-full pl-9 pr-2 rounded-md bg-white dark:bg-[#00000040] border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={activeFilters.startDate || ""}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                />
              </div>
            </label>
            <label className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <span className="ml-1">Hasta</span>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Calendar size={14} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  className="h-8 w-full pl-9 pr-2 rounded-md bg-white dark:bg-[#00000040] border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={activeFilters.endDate || ""}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                />
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
