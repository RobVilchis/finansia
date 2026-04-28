"use client";

import TransactionCard from "@/app/components/TransactionCard";
import { Transaction } from "@/app/data/DataDashboard";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { ArrowLeft, DollarSign, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  GlassDialogShell,
  GlassInput,
  GlassButton,
  FieldLabel,
  FieldError,
  glassDialogContent,
  GlassCard,
  SectionHeading,
} from "@/app/components/ui/glass";

interface Category {
  id: string;
  name: string;
  type: string;
  budget: string | null;
}

interface CategoryData {
  category: Category;
  transactions: Transaction[];
  summary: {
    totalAmount: number;
    transactionCount: number;
    averageAmount: number;
    lastTransactionDate: string | null;
  };
}

const editSchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido"),
  budget: z
    .number({ invalid_type_error: "Ingresa un número válido" })
    .positive("El presupuesto debe ser mayor a 0")
    .nullish(),
});

function formatMXN(amount: number, fractionDigits = 0) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

function getTypeLabel(type: string) {
  switch (type) {
    case "expense":
      return "Gasto";
    case "income":
      return "Ingreso";
    case "transfer":
      return "Transferencia";
    default:
      return type;
  }
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case "expense":
      return "bg-expense-soft border-expense-border text-expense";
    case "income":
      return "bg-income-soft border-income-border text-income";
    case "transfer":
      return "bg-accent-soft border-accent-border text-accent-fg";
    default:
      return "bg-surface border-edge text-ink-muted";
  }
}

function SummaryStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "income" | "expense";
}) {
  const valueTone =
    tone === "expense"
      ? "text-expense"
      : tone === "income"
        ? "text-income"
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

export default function CategoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      budget: undefined as number | null | undefined,
    },
  });

  const fetchCategoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/categories/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Categoría no encontrada");
        } else {
          throw new Error("Error al obtener datos de la categoría");
        }
        return;
      }
      const data = await response.json();
      setCategoryData(data);
      reset({
        name: data.category.name,
        budget: data.category.budget ? Number(data.category.budget) : null,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al obtener datos de la categoría");
      } else {
        setError("Error al obtener datos de la categoría");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, reset]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const onSubmitRename = async (data: { name: string; budget?: number | null }) => {
    try {
      setIsRenaming(true);
      const response = await fetch(`/api/categories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: categoryData?.category.type,
          budget: data.budget ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al renombrar la categoría");
      }

      setShowRenameDialog(false);
      fetchCategoryData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al renombrar la categoría");
      } else {
        setError("Error al renombrar la categoría");
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la categoría");
      }

      setShowDeleteDialog(false);
      router.push("/categories");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al eliminar la categoría");
      } else {
        setError("Error al eliminar la categoría");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    return transactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.date);
        let monthKey = date.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        });
        monthKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(transaction);
        return groups;
      },
      {} as Record<string, Transaction[]>,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="w-40 h-5 bg-surface-strong rounded animate-pulse mb-6" />
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <div className="w-48 h-8 bg-surface-strong rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="w-20 h-6 bg-surface-strong rounded-full animate-pulse" />
                <div className="w-32 h-5 bg-surface-strong rounded animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-10 bg-surface-strong rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="px-4 py-3">
                <div className="w-20 h-3 bg-surface-strong rounded mb-2 animate-pulse" />
                <div className="w-24 h-5 bg-surface-strong rounded animate-pulse" />
              </GlassCard>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full h-16 bg-surface-strong rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !categoryData) {
    return (
      <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-ink-subtle hover:text-ink mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Categorías
          </Link>
          <GlassCard className="px-6 py-10 text-center">
            <p className="text-expense mb-4">{error}</p>
            <Link href="/categories" className="text-accent-fg hover:underline">
              Volver a Categorías
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
        <div className="w-full max-w-4xl mx-auto text-center py-12">
          <p className="text-ink-subtle">Categoría no encontrada</p>
        </div>
      </div>
    );
  }

  const totalTone =
    categoryData.category.type === "expense"
      ? "expense"
      : categoryData.category.type === "income"
        ? "income"
        : "default";

  return (
    <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm text-ink-subtle hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Categorías
        </Link>

        {error && (
          <div className="mb-6 px-4 py-3 bg-expense-soft border border-expense-border rounded-xl">
            <p className="text-sm text-expense">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="flex gap-2 items-center mb-3">
                <h1 className="text-2xl font-semibold text-ink truncate">
                  {categoryData.category.name}
                </h1>
                <button
                  onClick={() => setShowRenameDialog(true)}
                  className="p-2 text-ink-faint hover:text-ink hover:bg-surface rounded-lg transition-colors cursor-pointer"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeClass(categoryData.category.type)}`}
                >
                  {getTypeLabel(categoryData.category.type)}
                </span>
                <span className="text-sm text-ink-subtle">
                  {categoryData.summary.transactionCount} transacciones
                </span>
                {categoryData.category.type === "expense" && (
                  <span className="text-sm text-ink-subtle">
                    Presupuesto:{" "}
                    <span className="font-mono text-ink-muted tabular-nums">
                      {categoryData.category.budget
                        ? formatMXN(Number(categoryData.category.budget))
                        : "Sin presupuesto"}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <GlassButton
              variant="danger"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <SummaryStat
            label="Monto total"
            value={formatMXN(categoryData.summary.totalAmount)}
            tone={totalTone}
          />
          <SummaryStat
            label="Promedio mensual"
            value={formatMXN(categoryData.summary.averageAmount, 2)}
          />
          <SummaryStat
            label="Última transacción"
            value={
              categoryData.summary.lastTransactionDate
                ? new Date(
                    categoryData.summary.lastTransactionDate,
                  ).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </div>

        <div className="space-y-5">
          <SectionHeading>Transacciones</SectionHeading>

          {categoryData.transactions.length > 0 ? (
            Object.entries(
              groupTransactionsByMonth(categoryData.transactions),
            ).map(([month, monthTransactions]) => {
              const monthlyTotal = monthTransactions.reduce(
                (sum, transaction) => sum + Number(transaction.amount),
                0,
              );
              return (
                <div key={month}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-ink-muted">
                      {month}
                    </h3>
                    {monthTransactions.length > 1 && (
                      <span className="text-xs font-mono tabular-nums text-ink-subtle">
                        Total {formatMXN(monthlyTotal)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {monthTransactions.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        description={transaction.description}
                        date={transaction.date}
                        amount={transaction.amount}
                        showCategory={false}
                        categoryName={transaction.categoryName}
                        type={transaction.type}
                        sourceAccountName={transaction.sourceAccountName}
                        targetAccountName={transaction.targetAccountName}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <GlassCard className="px-6 py-10 text-center">
              <p className="text-sm text-ink-subtle">
                No se encontraron transacciones en esta categoría.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      <Dialog.Root open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <Dialog.Content maxWidth="420px" className={glassDialogContent}>
          <VisuallyHidden>
            <Dialog.Title>Editar categoría</Dialog.Title>
          </VisuallyHidden>
          <GlassDialogShell
            icon={<Pencil size={16} />}
            title="Editar categoría"
            subtitle="Ajusta el nombre o presupuesto"
          >
            <form
              onSubmit={handleSubmit(onSubmitRename)}
              className="flex flex-col gap-4"
            >
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <GlassInput
                      {...field}
                      placeholder="Nombre de la categoría"
                    />
                  )}
                />
                <FieldError message={errors.name?.message} />
              </div>

              {categoryData.category.type === "expense" && (
                <div>
                  <FieldLabel>Presupuesto mensual (MXN)</FieldLabel>
                  <Controller
                    name="budget"
                    control={control}
                    render={({ field }) => (
                      <GlassInput
                        leadingIcon={<DollarSign size={16} />}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Sin presupuesto"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value),
                          )
                        }
                        className="font-mono tabular-nums"
                      />
                    )}
                  />
                  <FieldError message={errors.budget?.message} />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-edge-soft mt-2">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowRenameDialog(false)}
                >
                  Cancelar
                </GlassButton>
                <GlassButton type="submit" variant="primary" disabled={isRenaming}>
                  {isRenaming ? "Guardando..." : "Guardar"}
                </GlassButton>
              </div>
            </form>
          </GlassDialogShell>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Content maxWidth="420px" className={glassDialogContent}>
          <VisuallyHidden>
            <Dialog.Title>Eliminar categoría</Dialog.Title>
          </VisuallyHidden>
          <GlassDialogShell
            icon={<Trash2 size={16} />}
            title="Eliminar categoría"
            subtitle="Esta acción no se puede deshacer"
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink-muted">
                ¿Está seguro de que desea eliminar{" "}
                <span className="text-ink font-medium">
                  &quot;{categoryData.category.name}&quot;
                </span>
                ?
              </p>
              {categoryData.summary.transactionCount > 0 && (
                <div className="px-3 py-2 bg-expense-soft border border-expense-border rounded-lg">
                  <p className="text-xs text-expense">
                    Esta categoría tiene{" "}
                    {categoryData.summary.transactionCount} transacciones. No
                    puede eliminar una categoría con transacciones existentes.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t border-edge-soft mt-2">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancelar
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="danger"
                  disabled={
                    isDeleting || categoryData.summary.transactionCount > 0
                  }
                  onClick={confirmDelete}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </GlassButton>
              </div>
            </div>
          </GlassDialogShell>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
