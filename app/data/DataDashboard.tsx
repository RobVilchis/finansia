"use client";

import { Tabs } from "@radix-ui/themes";
import { Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AccountsList from "../components/AccountsList";
import { AddButton } from "../components/AddButton";
import { useToast } from "../components/GenericToast";
import GoalsList from "../components/GoalsList";
import NewAccountDialog from "../components/NewAccountDialog";
import NewTransactionDialog from "../components/NewTransactionDialog";
import TransactionCard from "../components/TransactionCard";
import TransactionDialog from "../components/TransactionDialog";
import UploadStatementDialog from "../components/UploadStatementDialog";
import { Goal } from "@/lib/services/goals";

export interface Transaction {
  id: string;
  description: string | null;
  date: Date;
  amount: string;
  categoryName: string | null;
  type: string;
  sourceAccountName: string | null;
  targetAccountName: string | null;
  sourceAccountId: string | null;
  targetAccountId?: string | null;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  // type: string;
  // createdAt: string;
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

export default function DataDashboard({
  transactions,
  accounts,
  goals,
  unverifiedTransactions,
  pendingStatements: pending,
}: {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  unverifiedTransactions: Transaction[];
  pendingStatements: Statement[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pendingStatements, setPendingStatements] =
    useState<Statement[]>(pending);
  const [processingStatement, setProcessingStatement] = useState(false);
  const { showToast } = useToast();

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
    [searchParams],
  );

  const fetchPendingStatements = useCallback(async () => {
    try {
      const response = await fetch("/api/pending-statements");
      if (!response.ok) throw new Error("Failed to pending statements");
      const data = await response.json();
      if (processingStatement && data.length == 0) {
        showToast({
          title: "Estado de cuenta procesado con éxito",
          message: "",
          variant: "success",
        });

        setProcessingStatement(false);
      }
      setPendingStatements(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [processingStatement]);

  /* useEffect(() => {
    fetchPendingStatements();
  }, [statementDialogOpen, fetchPendingStatements]); */

  // Poll for processing statements every 3 seconds
  useEffect(() => {
    if (pendingStatements.length === 0) {
      fetchPendingStatements();
      // setStatementProcessedToastOpen(true);
      return;
    }

    const intervalId = setInterval(() => {
      fetchPendingStatements();
      // Also refresh unverified transactions in case new ones were created
    }, 3000);

    return () => clearInterval(intervalId);
  }, [
    pendingStatements.length,
    fetchPendingStatements,
    setStatementDialogOpen,
  ]);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const handleAddTransaction = () => {
    setNewTransactionDialogOpen(false);
  };

  /* const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDialogOpen(true);
  }; */

  const groupTransactionsByDay = (transactions: Transaction[]) => {
    return transactions.reduce(
      (groups, transaction) => {
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
      },
      {} as Record<string, Transaction[]>,
    );
  };

  const closeAccountDialog = useCallback(() => {
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
              <GoalsList goals={goals} />
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
              <AccountsList
                accounts={accounts}
                onAccountUpdated={closeAccountDialog}
              />
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
                    {unverifiedTransactions.length !== 1 ? "es" : ""} sin
                    clasificar
                  </Link>
                </div>
              )}
              <div className="grid gap-4 mx-auto">
                {transactions.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Aún no se han registrado transacciones.
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
                                date={transaction.date}
                                amount={transaction.amount}
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
                    ),
                  )
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </main>

      <NewTransactionDialog
        open={dialogOpen}
        onOpenChange={setNewTransactionDialogOpen}
        onAddTransaction={handleAddTransaction}
      />

      <NewAccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        onAccountAdded={closeAccountDialog}
      />

      <UploadStatementDialog
        open={statementDialogOpen}
        onOpenChange={setStatementDialogOpen}
        onStatementUpload={() => {
          setProcessingStatement(true);
          fetchPendingStatements();
        }}
      />

      {selectedTransaction && (
        <TransactionDialog
          open={transactionDialogOpen}
          onOpenChange={setTransactionDialogOpen}
          transaction={selectedTransaction}
          onUpdate={() => setTransactionDialogOpen(false)}
          onDelete={() => setTransactionDialogOpen(false)}
        />
      )}
    </div>
    //</StatementProcessedToastProvider>
  );
}
