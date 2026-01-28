"use client";

import TransactionCard from "@/app/components/TransactionCard";
import { Transaction } from "@/app/data/DataDashboard";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, TextField } from "@radix-ui/themes";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

interface Category {
  id: string;
  name: string;
  type: string;
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

const renameSchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido"),
});

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: "",
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
      reset({ name: data.category.name });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al obtener datos de la categoría");
      } else {
        setError("Error al obtener datos de la categoría");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryData();
  }, [params.id, fetchCategoryData]);

  const handleRename = () => {
    setShowRenameDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const onSubmitRename = async (data: { name: string }) => {
    try {
      setIsRenaming(true);
      const response = await fetch(`/api/categories/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          type: categoryData?.category.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al renombrar la categoría");
      }

      setShowRenameDialog(false);
      fetchCategoryData(); // Refresh data
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
      router.push("/categories"); // Redirect to categories list
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

  const getTypeLabel = (type: string) => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>

          {/* Category Header Skeleton */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <div className="w-48 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                  <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Category Summary Skeleton */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-end justify-between gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="w-28 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List Skeleton */}
          <div className="space-y-4">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>

            {/* Month Group Skeleton */}
            <div>
              <div className="w-40 h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2  text-slate-600 
            dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Categorías
          </Link>
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Volver a Categorías
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-slate-600 dark:text-slate-400">
              Categoría no encontrada
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    return transactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.date);
        let monthKey = date.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        });

        monthKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(transaction);
        return groups;
      },
      {} as Record<string, Transaction[]>,
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/categories"
          className="inline-flex items-center font-medium gap-2 text-slate-500 
          dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Categorías
        </Link>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Category Header */}
        <div className="mb-6 ">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex gap-2 items-center  mb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {categoryData.category.name}
                </h1>
                <button
                  onClick={handleRename}
                  className="flex items-center gap-2 px-2 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 font-bold" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-700 `}
                >
                  {getTypeLabel(categoryData.category.type)}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {categoryData.summary.transactionCount} transacciones
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 dark:bg-red-950 bg-red-100 
                hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>

          {/* Category Summary */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-end justify-between gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Monto total
                </p>
                <p className={`text-lg sm:text-2xl font-bold`}>
                  ${categoryData.summary.totalAmount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Promedio por transacción
                </p>
                <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${categoryData.summary.averageAmount.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Última transacción
                </p>
                <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {categoryData.summary.lastTransactionDate
                    ? new Date(
                        categoryData.summary.lastTransactionDate,
                      ).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Transacciones
            </h2>
          </div>

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
                  <div className="flex justify-between items-center">
                    <h2 className="text-md font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      {month}
                    </h2>
                    {monthTransactions.length > 1 && (
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                        Total - ${monthlyTotal}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {monthTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        /* onClick={() => {
                        setSelectedTransaction(transaction);
                        setTransactionDialogOpen(true);
                      }} */
                      >
                        <TransactionCard
                          description={transaction.description}
                          date={transaction.date}
                          amount={transaction.amount}
                          showCategory={false}
                          categoryName={transaction.categoryName}
                          type={transaction.type}
                          sourceAccountName={transaction.sourceAccountName}
                          targetAccountName={transaction.targetAccountName}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                No se encontraron transacciones en esta categoría.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog.Root open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Renombrar Categoría</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmitRename)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre de la Categoría
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField.Root
                    {...field}
                    placeholder="Ingrese el nombre de la categoría"
                    className="w-full"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="soft"
                onClick={() => setShowRenameDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming ? "Renombrando..." : "Renombrar"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Eliminar categoría</Dialog.Title>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              ¿Está seguro de que desea eliminar &quot;
              {categoryData.category.name}&quot;? Esta acción no se puede
              deshacer.
            </p>
            {categoryData.summary.transactionCount > 0 && (
              <p className="text-red-600 dark:text-red-400 text-sm">
                Esta categoría tiene {categoryData.summary.transactionCount}{" "}
                transacciones. No puede eliminar una categoría con transacciones
                existentes.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                variant="soft"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                disabled={
                  isDeleting || categoryData.summary.transactionCount > 0
                }
                onClick={confirmDelete}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
