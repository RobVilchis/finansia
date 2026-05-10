"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TransactionCard from "@/app/components/TransactionCard";
import TransactionDialog from "@/app/components/TransactionDialog";
import { Transaction } from "../DataDashboard";

interface ReviewPageClientProps {
  initialTransactions: Transaction[];
}

export default function ReviewPageClient({
  initialTransactions,
}: ReviewPageClientProps) {
  const router = useRouter();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  // Sync state with server data when props change (after router.refresh())
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const handleRefresh = useCallback(() => {
    // Refresh the page data by revalidating the server component
    // The server component will re-fetch and pass new data via props
    router.refresh();
  }, [router]);

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
          <div className="flex flex-col md:flex-row mb-4 gap-3 md:items-center  justify-between">
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
            className="py-3 px-4 bg-slate-100 dark:bg-slate-800 
          rounded-md font-medium dark:text-slate-300   text-slate-500 mb-4"
          >
            Estas transacciones no pudieron ser clasificadas automáticamente de
            tus estados de cuenta. Por favor revísalas.
          </div>

          <div className="grid gap-4 mx-auto">
            {transactions.length === 0 ? (
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
                              date={transaction.date}
                              showCategory={false}
                              amount={transaction.amount}
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
            description: selectedTransaction.description,
            date: selectedTransaction.date,
            type: selectedTransaction.type,
            amount: selectedTransaction.amount,
            categoryName: selectedTransaction.categoryName || null,
            sourceAccountId: selectedTransaction.sourceAccountId,
            targetAccountId: selectedTransaction.targetAccountId,
          }}
          onUpdate={() => {
            setTransactionDialogOpen(false);
            handleRefresh();
          }}
          onDelete={() => {
            setTransactionDialogOpen(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
