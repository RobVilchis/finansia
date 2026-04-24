"use client";

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
import TransactionFilters, {
  type ActiveFilters,
} from "../components/TransactionFilters";
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

export interface Category {
  id: string;
  name: string;
  type: string;
}

const TABS = [
  { key: "transactions", label: "Transacciones" },
  { key: "goals", label: "Metas" },
  { key: "accounts", label: "Cuentas" },
] as const;

export default function DataDashboard({
  transactions,
  accounts,
  goals,
  unverifiedTransactions,
  pendingStatements: pending,
  categories,
  currentPage,
  totalPages,
  totalCount,
  activeFilters,
}: {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  unverifiedTransactions: Transaction[];
  pendingStatements: Statement[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  activeFilters: ActiveFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pendingStatements, setPendingStatements] =
    useState<Statement[]>(pending);
  const [processingStatement, setProcessingStatement] = useState(false);
  const { showToast } = useToast();

  const activeTab = searchParams.get("tab") || "transactions";

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
        router.refresh();
      }
      setPendingStatements(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [processingStatement]);

  useEffect(() => {
    if (pendingStatements.length === 0) {
      fetchPendingStatements();
      return;
    }
    const intervalId = setInterval(() => {
      fetchPendingStatements();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [pendingStatements.length, fetchPendingStatements, setStatementDialogOpen]);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const handleAddTransaction = () => {
    setNewTransactionDialogOpen(false);
  };

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
        if (!groups[dayKey]) groups[dayKey] = [];
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
    <div className="relative min-h-screen bg-gray-950 font-(family-name:--font-outfit)">

      <div className="relative flex justify-center container mx-auto px-8 py-6 min-h-screen">
        <main className="flex flex-col w-full max-w-[500px]">

          {/* Glass tab bar */}
          <div className="flex gap-1 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => router.push(`?${createQueryString("tab", key)}`)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === key
                    ? "bg-white/15 text-white shadow-inner shadow-black/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Goals tab */}
          {activeTab === "goals" && <GoalsList goals={goals} />}

          {/* Accounts tab */}
          {activeTab === "accounts" && (
            <div className="grow">
              <div className="flex mb-6 gap-3 items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">Cuentas</h1>
                <AddButton onClick={() => setAccountDialogOpen(true)} />
              </div>
              <AccountsList accounts={accounts} onAccountUpdated={closeAccountDialog} />
            </div>
          )}

          {/* Transactions tab */}
          {activeTab === "transactions" && (
            <div className="grow">
              <div className="flex gap-3 items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-white">Transacciones</h1>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                    onClick={() => setStatementDialogOpen(true)}
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <AddButton onClick={() => setNewTransactionDialogOpen(true)} />
                </div>
              </div>

              <TransactionFilters
                categories={categories}
                accounts={accounts}
                activeFilters={activeFilters}
              />

              {pendingStatements.length > 0 && (
                <div className="w-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4 flex items-center gap-3 mb-4">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  <span className="text-cyan-300 text-sm font-medium">
                    Procesando estado de cuenta
                  </span>
                </div>
              )}

              {unverifiedTransactions.length > 0 && (
                <div className="mb-3">
                  <Link
                    href="/data/review"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    Revisar {unverifiedTransactions.length} transaccion
                    {unverifiedTransactions.length !== 1 ? "es" : ""} sin clasificar
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-4 mx-auto">
                {transactions.length === 0 ? (
                  <div className="text-center text-white/30 py-12 text-sm">
                    {activeFilters.type ||
                      activeFilters.category ||
                      activeFilters.account ||
                      activeFilters.startDate ||
                      activeFilters.endDate ||
                      activeFilters.description
                      ? "No se encontraron transacciones con los filtros seleccionados."
                      : "Aun no se han registrado transacciones."}
                  </div>
                ) : (
                  Object.entries(groupTransactionsByDay(transactions)).map(
                    ([day, dayTransactions]) => (
                      <div key={day}>
                        <h2 className="text-[11px] font-medium text-white/30 uppercase tracking-widest mb-2 px-1">
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
                                sourceAccountName={transaction.sourceAccountName}
                                targetAccountName={transaction.targetAccountName}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>

              {totalCount > 0 && (
                <div className="mt-8 flex flex-col items-center gap-3 pb-4">
                  <p className="text-xs text-white/30">
                    Mostrando {transactions.length} de {totalCount} transacciones
                  </p>
                  {totalPages > 1 && (
                    <div className="flex gap-2 items-center">
                      {currentPage > 1 && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("page", String(currentPage - 1));
                            router.push(`?${params.toString()}`);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          Anterior
                        </button>
                      )}
                      <span className="text-sm text-white/30 px-2">
                        {currentPage} / {totalPages}
                      </span>
                      {currentPage < totalPages && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("page", String(currentPage + 1));
                            router.push(`?${params.toString()}`);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          Siguiente
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

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
  );
}
