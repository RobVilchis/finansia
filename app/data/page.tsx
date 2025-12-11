"use client";

import { Tabs } from "@radix-ui/themes";
import { Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AccountsList from "../components/AccountsList";
import { AddButton } from "../components/AddButton";
import GoalsList from "../components/GoalsList";
import NewAccountDialog from "../components/NewAccountDialog";
import NewExpenseDialog from "../components/NewTransactionDialog";
import TransactionCard from "../components/TransactionCard";
import TransactionDialog from "../components/TransactionDialog";
import UploadStatementDialog from "../components/UploadStatementDialog";
import { useTransactions } from "../contexts/TransactionsContext";

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  categoryName: string;
  type: "income" | "expense" | "transfer";
  sourceAccountName: string;
  targetAccountName: string;
  sourceAccountId: string;
  targetAccountId?: string;
}

interface Statement {
  id: string;
  userId: string | null;
  originalFileName: string;
  extractedText: string | null;
  status: "uploaded" | "processing" | "ready" | "error" | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { transactionUpdateCount } = useTransactions();
  const [dialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unverifiedTransactions, setUnverifiedTransactions] = useState<
    Transaction[]
  >([]);
  const [pendingStatements, setPendingStatements] = useState<Statement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  /*   const [statementProcessedToastOpen, setStatementProcessedToastOpen] =
      useState(false); */

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnverifiedTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/unverified-transactions");
      if (!response.ok)
        throw new Error("Failed to fetch unverified transactions");
      const data = await response.json();
      setUnverifiedTransactions(data);
    } catch (error) {
      console.error("Error fetching unverified transactions:", error);
    }
  }, []);

  const fetchPendingStatements = useCallback(async () => {
    try {
      const response = await fetch("/api/pending-statements");
      if (!response.ok) throw new Error("Failed to pending statements");
      const data = await response.json();
      setPendingStatements(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  useEffect(() => {
    fetchPendingStatements();
  }, [statementDialogOpen, fetchPendingStatements]);

  // Poll for processing statements every 3 seconds
  useEffect(() => {
    if (pendingStatements.length === 0) {
      fetchPendingStatements();
      fetchTransactions();
      // setStatementProcessedToastOpen(true);
      return;
    }

    const intervalId = setInterval(() => {
      fetchPendingStatements();
      // Also refresh unverified transactions in case new ones were created
      fetchUnverifiedTransactions();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [
    pendingStatements.length,
    fetchPendingStatements,
    fetchUnverifiedTransactions,
  ]);

  useEffect(() => {
    fetch("api/create-user");
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchUnverifiedTransactions();
  }, [fetchUnverifiedTransactions]);

  // Refresh transactions when transactionUpdateCount changes
  useEffect(() => {
    if (transactionUpdateCount > 0) {
      fetchTransactions();
      fetchUnverifiedTransactions();
    }
  }, [transactionUpdateCount, fetchTransactions, fetchUnverifiedTransactions]);

  const handleAddTransaction = async (newTransaction: {
    description: string;
    date: string;
    amount: number;
    category: string;
    type: string;
    accountId: string;
    targetAccountId?: string;
  }) => {
    setNewTransactionDialogOpen(false);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });

      if (!response.ok) throw new Error("Failed to add transaction");

      // Refresh transactions list
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: {
    id: string;
    description: string;
    date: string;
    amount: number;
    category: string | undefined;
    type: string;
    accountId?: string;
    targetAccountId?: string;
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
      fetchTransactions();
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
      fetchTransactions();
      setTransactionDialogOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  /* const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDialogOpen(true);
  }; */

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

  const closeAcountDialog = useCallback(() => {
    setAccountDialogOpen(false);
  }, []);

  return (
    //<StatementProcessedToastProvider open={statementProcessedToastOpen} setOpen={setStatementProcessedToastOpen}>
    <div className="flex justify-center container mx-auto px-8 py-4 min-h-screen">
      <main className="flex flex-col w-full max-w-[500px] ">
        <div className="grow">
          <Tabs.Root
            value={searchParams.get("tab") || "transactions"}
            onValueChange={(value) => {
              router.push(`?${createQueryString("tab", value)}`);
            }}
          >
            <Tabs.List className="mb-4" color="indigo">
              <Tabs.Trigger
                onClick={() => {
                  router.push(`?${createQueryString("tab", "transactions")}`);
                }}
                value="transactions"
              >
                Transacciones
              </Tabs.Trigger>
              <Tabs.Trigger
                onClick={() => {
                  router.push(`?${createQueryString("tab", "goals")}`);
                }}
                value="goals"
              >
                Metas
              </Tabs.Trigger>
              <Tabs.Trigger
                onClick={() => {
                  router.push(`?${createQueryString("tab", "accounts")}`);
                }}
                value="accounts"
              >
                Cuentas
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="goals">
              <GoalsList />
            </Tabs.Content>
            <Tabs.Content value="accounts">
              <div className="flex mb-8 gap-3 items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cuentas
                </h1>
                <AddButton
                  onClick={() => {
                    setAccountDialogOpen(true);
                  }}
                />
              </div>
              <AccountsList onAccountAdded={closeAcountDialog} />
            </Tabs.Content>
            <Tabs.Content value="transactions">
              <div
                className={`flex gap-3 items-center justify-between ${unverifiedTransactions.length > 0 ? "mb-4" : "mb-8"
                  }`}
              >
                <h1 className="text-2xl font-bold ">Transacciones recientes</h1>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-none  text-slate-500  
                    px-2 py-2 text-sm font-medium"
                    onClick={() => setStatementDialogOpen(true)}
                  >
                    <Upload className="w-6 h-6 text-slate-500 font-bold" />
                  </button>
                  <AddButton
                    onClick={() => setNewTransactionDialogOpen(true)}
                  />
                </div>
              </div>
              {pendingStatements.length > 0 && (
                <div className=" align-middle w-full h-16 bg-blue-500 dark:bg-blue-950 rounded-md text-md p-4 flex items-center gap-2 mb-3">
                  <Loader2 className="w-5 h-5 text-blue-400 opacity-70 animate-spin" />
                  <span className="text-blue-400 opacity-70">
                    Procesando estado de cuenta
                  </span>
                </div>
              )}
              {unverifiedTransactions.length > 0 && (
                <div className="mb-2">
                  <Link
                    href="/data/review"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Revisar {unverifiedTransactions.length} transaccion
                    {unverifiedTransactions.length !== 1 ? "es" : ""} pendiente
                    {unverifiedTransactions.length !== 1 ? "s" : ""}
                  </Link>
                </div>
              )}
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
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    No se encontraron transacciones
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
                            <div
                              key={transaction.id}
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
                                amount={Number(transaction.amount)}
                                categoryName={transaction.categoryName}
                                type={transaction.type}
                                sourceAccountName={
                                  transaction.sourceAccountName
                                }
                                targetAccountName={
                                  transaction.targetAccountName
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </main>

      <NewExpenseDialog
        open={dialogOpen}
        onOpenChange={setNewTransactionDialogOpen}
        onAddExpense={(expense) =>
          handleAddTransaction({
            description: expense.concept,
            date: expense.date,
            amount: expense.amount,
            category: expense.category,
            type: expense.type,
            accountId: expense.accountId,
            targetAccountId: expense.targetAccountId,
          })
        }
      />

      <NewAccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        onAccountAdded={closeAcountDialog}
      />

      <UploadStatementDialog
        open={statementDialogOpen}
        onOpenChange={setStatementDialogOpen}
      />

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
            category: selectedTransaction.categoryName,
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
            })
          }
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
    //</StatementProcessedToastProvider>
  );
}
