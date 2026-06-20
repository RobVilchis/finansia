"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CategoryCard from "@/app/components/CategoryCard";
import CategoryDialog from "@/app/components/CategoryDialog";
import { AddButton } from "@/app/components/AddButton";
import { GlassButton, GlassInput } from "@/app/components/ui/glass";
import { EmptyState, ErrorState } from "@/app/components/ui/states";
import { Toast } from "radix-ui";
import { Check, FolderOpen, Plus, Search, SearchX } from "lucide-react";

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Category {
  id: string;
  name: string;
  type: string;
  budget: string | null;
  spent: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const sortedData = data.sort(
        (a: { spent: string }, b: { spent: string }) =>
          Number(b.spent) - Number(a.spent),
      );
      setCategories(sortedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al obtener categorías");
      } else {
        setError("Error al obtener categorías");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const expenseCategories = filteredCategories.filter(
    (cat) => cat.type === "expense",
  );
  const incomeCategories = filteredCategories.filter(
    (cat) => cat.type === "income",
  );

  // Summary stats — computed from all expense categories (unfiltered)
  const allExpense = categories.filter((c) => c.type === "expense");
  const budgeted = allExpense.filter((c) => c.budget && Number(c.budget) > 0);
  const totalSpent = allExpense.reduce((s, c) => s + Number(c.spent), 0);
  const totalBudget = budgeted.reduce((s, c) => s + Number(c.budget), 0);
  const overCategories = budgeted.filter(
    (c) => Number(c.spent) > Number(c.budget),
  );
  const warningCategories = budgeted.filter((c) => {
    const pct = Number(c.spent) / Number(c.budget);
    return pct >= 0.75 && pct <= 1;
  });
  const totalOverspent = overCategories.reduce(
    (s, c) => s + (Number(c.spent) - Number(c.budget)),
    0,
  );
  const hasBudgetData = budgeted.length > 0;

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const onCategoryAdded = () => {
    setOpen(false);
    fetchCategories();

    setToastOpen(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setToastOpen(true);
    }, 100);
  };

  return (
    <Toast.Provider swipeDirection="right">
      <section className="container px-5 md:px-10 p-4 pb-28 min-h-screen flex justify-center w-full">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Categorías</h1>

          {/* Summary Stats */}
          {!loading && !error && hasBudgetData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              <div className="rounded-xl border border-edge bg-surface backdrop-blur-md px-4 py-3">
                <p className="text-xs text-ink-subtle mb-1">Gastado este mes</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {formatMXN(totalSpent)}
                </p>
              </div>
              <div className="rounded-xl border border-edge bg-surface backdrop-blur-md px-4 py-3">
                <p className="text-xs text-ink-subtle mb-1">Presupuesto total</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {formatMXN(totalBudget)}
                </p>
              </div>
              <div
                className={`rounded-xl border backdrop-blur-md px-4 py-3 ${
                  overCategories.length > 0
                    ? "border-expense-border bg-expense-soft"
                    : "border-edge bg-surface"
                }`}
              >
                <p className="text-xs text-ink-subtle mb-1">
                  Excedido
                  {overCategories.length > 0 &&
                    ` · ${overCategories.length} categ.`}
                </p>
                <p
                  className={`font-mono text-lg font-semibold tabular-nums ${
                    overCategories.length > 0 ? "text-expense" : "text-ink"
                  }`}
                >
                  {totalOverspent > 0 ? formatMXN(totalOverspent) : "—"}
                </p>
              </div>
              <div
                className={`rounded-xl border backdrop-blur-md px-4 py-3 ${
                  warningCategories.length > 0
                    ? "border-warn-border bg-warn-soft"
                    : "border-edge bg-surface"
                }`}
              >
                <p className="text-xs text-ink-subtle mb-1">En alerta</p>
                <p
                  className={`font-mono text-lg font-semibold tabular-nums ${
                    warningCategories.length > 0 ? "text-warn" : "text-ink"
                  }`}
                >
                  {warningCategories.length > 0
                    ? `${warningCategories.length} categ.`
                    : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex justify-between items-center gap-3 mb-6">
            <div className="w-full max-w-md">
              <GlassInput
                type="text"
                placeholder="Buscar categoría"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leadingIcon={<Search size={16} />}
              />
            </div>
            <AddButton onClick={() => setOpen(true)} />
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-surface backdrop-blur-md rounded-xl p-4 border border-edge"
                >
                  <div className="space-y-3">
                    <div className="w-32 h-4 bg-surface-strong rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-surface-strong rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && !loading && (
            <ErrorState
              title="No se pudieron cargar las categorías"
              message="Revisa tu conexión e intenta de nuevo."
              onRetry={fetchCategories}
            />
          )}
          {!loading && !error && (
            <>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-ink-muted">
                  Gastos
                </h2>
                {expenseCategories.length === 0 ? (
                  searchTerm ? (
                    <EmptyState
                      compact
                      icon={<SearchX size={18} />}
                      title="Sin coincidencias"
                      description="Ninguna categoría de gastos coincide con tu búsqueda."
                    />
                  ) : (
                    <EmptyState
                      compact
                      icon={<FolderOpen size={18} />}
                      title="No hay categorías de gastos"
                      description="Crea una categoría para organizar tus gastos."
                      action={
                        <GlassButton
                          variant="secondary"
                          onClick={() => setOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus size={14} />
                          Crear categoría
                        </GlassButton>
                      }
                    />
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {expenseCategories.map((cat) => (
                      <CategoryCard key={cat.id} category={cat} />
                    ))}
                  </div>
                )}
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-4 text-ink-muted">
                  Ingresos
                </h2>
                {incomeCategories.length === 0 ? (
                  searchTerm ? (
                    <EmptyState
                      compact
                      icon={<SearchX size={18} />}
                      title="Sin coincidencias"
                      description="Ninguna categoría de ingresos coincide con tu búsqueda."
                    />
                  ) : (
                    <EmptyState
                      compact
                      icon={<FolderOpen size={18} />}
                      title="No hay categorías de ingresos"
                      description="Crea una categoría para clasificar tus ingresos."
                      action={
                        <GlassButton
                          variant="secondary"
                          onClick={() => setOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus size={14} />
                          Crear categoría
                        </GlassButton>
                      }
                    />
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {incomeCategories.map((cat) => (
                      <CategoryCard key={cat.name} category={cat} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
        <CategoryDialog
          open={open}
          onOpenChange={setOpen}
          onCategoryAdded={onCategoryAdded}
        />
        <Toast.Root
          className="pointer-events-auto w-72 grid grid-cols-[auto_max-content] items-center gap-x-[15px] rounded-xl bg-app/95 backdrop-blur-xl border border-income-border px-[15px] pt-[15px] pb-[12px] shadow-2xl shadow-black/50 [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-income-soft border border-income-border text-income">
              <Check className="h-5 w-5" />
            </span>
            <Toast.Title className="text-[15px] text-ink font-medium">
              ¡La categoría se agregó exitosamente!
            </Toast.Title>
          </div>
        </Toast.Root>
        <Toast.Viewport className="pointer-events-none fixed bottom-4 right-8 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
      </section>
    </Toast.Provider>
  );
}
