"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TransactionCard from "../../components/TransactionCard";
import TransactionDialog from "../../components/TransactionDialog";
import { useTransactions } from "../../contexts/TransactionsContext";

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  categoryName: string | null;
  type: "income" | "expense" | "transfer";
  sourceAccountName: string | null;
  targetAccountName: string | null;
  sourceAccountId: string;
  targetAccountId?: string;
  isUnverified?: boolean;
}

export default function ReviewPage() {
  const { transactionUpdateCount } = useTransactions();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const fetchUnverifiedTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/unverified-transactions");
      if (!response.ok)
        throw new Error("Failed to fetch unverified transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching unverified transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnverifiedTransactions();
  }, [fetchUnverifiedTransactions]);

  // Refresh transactions when transactionUpdateCount changes
  useEffect(() => {
    if (transactionUpdateCount > 0) {
      fetchUnverifiedTransactions();
    }
  }, [transactionUpdateCount, fetchUnverifiedTransactions]);

  const handleUpdateTransaction = async (updatedTransaction: {
    id: string;
    description: string;
    date: string;
    amount: number;
    category: string | undefined;
    type: string;
    accountId?: string;
    targetAccountId?: string;
    isUnverified?: boolean;
  }) => {
    try {
      setTransactionDialogOpen(false);
      const response = await fetch(`/api/transactions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTransaction),
      });

      if (!response.ok) throw new Error("Failed to update transaction");

      // Refresh transactions list
      fetchUnverifiedTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

      // Refresh transactions list
      fetchUnverifiedTransactions();
      setTransactionDialogOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const groupTransactionsByDay = (transactions: Transaction[]) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      let dayKey = date.toLocaleDateString("es-MX", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      dayKey = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  };

  return (
    <div className="flex justify-center container mx-auto px-8 py-4 min-h-screen">
      <main className="flex flex-col w-full max-w-[500px]">
        <div className="grow">
          <div className="flex mb-4 gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/data"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Revisar transacciones
              </h1>
            </div>

            {transactions.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {transactions.length} pendiente
                {transactions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div
            className="py-3 px-4 bg-slate-300 dark:bg-slate-800 
          rounded-md font-medium dark:text-slate-300   text-slate-500 mb-4"
          >
            Estas transacciones no pudieron ser clasificadas automáticamente de
            tus estados de cuenta. Por favor revísalas.
          </div>

          <div className="grid gap-4 mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="space-y-3">
                      <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-48 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-lg mb-2">No hay transacciones pendientes</p>
                <p className="text-sm">
                  Todas las transacciones han sido revisadas
                </p>
              </div>
            ) : (
              Object.entries(groupTransactionsByDay(transactions)).map(
                ([day, dayTransactions]) => (
                  <div key={day}>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-400 mb-2">
                      {day}
                    </h2>
                    <div className="space-y-2">
                      {dayTransactions.map((transaction) => (
                        <div key={transaction.id} className="relative">
                          <div
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setTransactionDialogOpen(true);
                            }}
                          >
                            <TransactionCard
                              description={transaction.description}
                              date={new Date(
                                transaction.date
                              ).toLocaleDateString()}
                              showCategory={false}
                              amount={Number(transaction.amount)}
                              categoryName={transaction.categoryName || ""}
                              type={transaction.type}
                              sourceAccountName={
                                transaction.sourceAccountName || ""
                              }
                              targetAccountName={
                                transaction.targetAccountName || ""
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </main>

      {selectedTransaction && (
        <TransactionDialog
          open={transactionDialogOpen}
          onOpenChange={setTransactionDialogOpen}
          transaction={{
            id: selectedTransaction.id,
            concept: selectedTransaction.description,
            date: selectedTransaction.date,
            type: selectedTransaction.type,
            amount: Number(selectedTransaction.amount),
            category: selectedTransaction.categoryName || undefined,
            accountId: selectedTransaction.sourceAccountId,
            targetAccountId: selectedTransaction.targetAccountId,
          }}
          onUpdate={(expense) =>
            handleUpdateTransaction({
              id: expense.id,
              description: expense.concept,
              date: expense.date,
              amount: expense.amount,
              category: expense.category,
              type: expense.type,
              accountId: expense.accountId,
              targetAccountId: expense.targetAccountId,
              isUnverified: false,
            })
          }
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}
