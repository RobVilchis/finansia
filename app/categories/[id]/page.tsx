"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TransactionCard from "@/app/components/TransactionCard";
import { Dialog, TextField, Button } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  categoryName: string;
  type: "income" | "expense" | "transfer";
  sourceAccountName: string | null;
  targetAccountName: string | null;
}

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
  name: z.string().min(1, "Category name is required"),
});

export default function CategoryPage({ params }: { params: { id: string } }) {
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

  useEffect(() => {
    fetchCategoryData();
  }, [params.id]);

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/categories/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Category not found");
        } else {
          throw new Error("Failed to fetch category data");
        }
        return;
      }
      const data = await response.json();
      setCategoryData(data);
      reset({ name: data.category.name });
    } catch (err: any) {
      setError(err.message || "Failed to fetch category data");
    } finally {
      setIsLoading(false);
    }
  };

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
        throw new Error("Failed to rename category");
      }

      setShowRenameDialog(false);
      fetchCategoryData(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to rename category");
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
        throw new Error(errorData.error || "Failed to delete category");
      }

      setShowDeleteDialog(false);
      router.push("/categories"); // Redirect to categories list
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "text-red-600 dark:text-red-400";
      case "income":
        return "text-green-600 dark:text-green-400";
      case "transfer":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "expense":
        return "Expense";
      case "income":
        return "Income";
      case "transfer":
        return "Transfer";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-slate-600 dark:text-slate-400">Loading...</div>
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
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Return to Categories
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
              Category not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Category Header */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {categoryData.category.name}
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-700 ${getTypeColor(
                    categoryData.category.type
                  )}`}
                >
                  {getTypeLabel(categoryData.category.type)}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {categoryData.summary.transactionCount} transactions
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleRename}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Category Summary */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Amount
                </p>
                <p
                  className={`text-2xl font-bold ${getTypeColor(
                    categoryData.category.type
                  )}`}
                >
                  ${categoryData.summary.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Average per Transaction
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${categoryData.summary.averageAmount.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Last Transaction
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {categoryData.summary.lastTransactionDate
                    ? new Date(
                        categoryData.summary.lastTransactionDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Transactions
            </h2>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Showing {categoryData.transactions.length} transactions
            </span>
          </div>

          {categoryData.transactions.length > 0 ? (
            <div className="space-y-3">
              {categoryData.transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  description={transaction.description}
                  date={transaction.date}
                  amount={transaction.amount}
                  categoryName={transaction.categoryName}
                  type={transaction.type}
                  sourceAccountName={transaction.sourceAccountName}
                  targetAccountName={transaction.targetAccountName}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                No transactions found in this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog.Root open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Rename Category</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmitRename)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Name
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField.Root
                    {...field}
                    placeholder="Enter category name"
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
                Cancel
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Delete Category</Dialog.Title>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete "{categoryData.category.name}"?
              This action cannot be undone.
            </p>
            {categoryData.summary.transactionCount > 0 && (
              <p className="text-red-600 dark:text-red-400 text-sm">
                This category has {categoryData.summary.transactionCount}{" "}
                transactions. You cannot delete a category with existing
                transactions.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="soft" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                color="red"
                disabled={
                  isDeleting || categoryData.summary.transactionCount > 0
                }
                onClick={confirmDelete}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
