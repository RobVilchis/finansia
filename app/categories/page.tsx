"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import CategoryCard from "../components/CategoryCard";
import CategoryDialog from "../components/CategoryDialog";
import { AddButton } from "../components/AddButton";
import { useToast } from "../components/GenericToast";
import { GlassCard, SectionHeading } from "../components/ui/glass";

interface Category {
  id: string;
  name: string;
  type: string;
  budget: string | null;
  spent: number;
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn" | "expense";
}) {
  const valueTone =
    tone === "expense"
      ? "text-expense"
      : tone === "warn"
        ? "text-warn"
        : "text-ink";

  return (
    <GlassCard className="px-4 py-3">
      <p className="text-[11px] text-ink-subtle uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`font-mono text-lg font-semibold tabular-nums ${valueTone}`}>
        {value}
      </p>
    </GlassCard>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al obtener categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expenseCategories = filteredCategories.filter((cat) => cat.type === "expense");
  const incomeCategories = filteredCategories.filter((cat) => cat.type === "income");

  const allExpense = categories.filter((c) => c.type === "expense");
  const budgeted = allExpense.filter((c) => c.budget && Number(c.budget) > 0);
  const totalSpent = allExpense.reduce((s, c) => s + Number(c.spent), 0);
  const totalBudget = budgeted.reduce((s, c) => s + Number(c.budget), 0);
  const overCategories = budgeted.filter((c) => Number(c.spent) > Number(c.budget));
  const warningCategories = budgeted.filter((c) => {
    const pct = Number(c.spent) / Number(c.budget);
    return pct >= 0.75 && pct <= 1;
  });
  const totalOverspent = overCategories.reduce(
    (s, c) => s + (Number(c.spent) - Number(c.budget)),
    0
  );
  const hasBudgetData = budgeted.length > 0;

  const onCategoryAdded = () => {
    setOpen(false);
    fetchCategories();
    showToast({
      title: "Categoría creada",
      message: "La categoría se agregó exitosamente.",
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-ink mb-6">Categorías</h1>

        {!loading && !error && hasBudgetData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Gastado" value={formatMXN(totalSpent)} />
            <StatCard label="Presupuesto" value={formatMXN(totalBudget)} />
            <StatCard
              label={`Excedido${overCategories.length > 0 ? ` · ${overCategories.length}` : ""}`}
              value={totalOverspent > 0 ? formatMXN(totalOverspent) : "—"}
              tone={overCategories.length > 0 ? "expense" : "default"}
            />
            <StatCard
              label="En alerta"
              value={warningCategories.length > 0 ? `${warningCategories.length} categ.` : "—"}
              tone={warningCategories.length > 0 ? "warn" : "default"}
            />
          </div>
        )}

        <div className="flex justify-between items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar categoría"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4
                bg-surface backdrop-blur-md border border-edge rounded-lg
                text-sm text-ink placeholder:text-ink-faint
                focus:outline-none focus:border-accent-border focus:bg-surface-strong
                hover:border-edge-strong transition-all"
            />
          </div>
          <AddButton onClick={() => setOpen(true)} />
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <GlassCard key={i} className="px-4 py-3.5">
                <div className="space-y-3">
                  <div className="w-32 h-4 bg-surface-strong rounded animate-pulse" />
                  <div className="w-24 h-3 bg-surface-strong rounded animate-pulse" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-expense">{error}</p>}

        {!loading && !error && (
          <>
            <section className="mb-8">
              <SectionHeading>Gastos</SectionHeading>
              <div className="mt-3">
                {expenseCategories.length === 0 ? (
                  <p className="text-sm text-ink-faint py-4">
                    {searchTerm
                      ? "No se encontraron categorías de gastos que coincidan con la búsqueda."
                      : "No se encontraron categorías de gastos."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {expenseCategories.map((cat) => (
                      <CategoryCard key={cat.id} category={cat} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section>
              <SectionHeading>Ingresos</SectionHeading>
              <div className="mt-3">
                {incomeCategories.length === 0 ? (
                  <p className="text-sm text-ink-faint py-4">
                    {searchTerm
                      ? "No se encontraron categorías de ingresos que coincidan con la búsqueda."
                      : "No se encontraron categorías de ingresos."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {incomeCategories.map((cat) => (
                      <CategoryCard key={cat.id} category={cat} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <CategoryDialog
        open={open}
        onOpenChange={setOpen}
        onCategoryAdded={onCategoryAdded}
      />
    </div>
  );
}
