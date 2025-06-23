"use client";

import { useChat } from "@ai-sdk/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Tabs } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AccountsList from "./components/AccountsList";
import { AddButton } from "./components/AddButton";
import ChatUI from "./components/ChatUI";
import GoalsList from "./components/GoalsList";
import NewAccountDialog from "./components/NewAccountDialog";
import NewExpenseDialog from "./components/NewTransactionDialog";
import TransactionCard from "./components/TransactionCard";
import TransactionDialog from "./components/TransactionDialog";

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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [dialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

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

  useEffect(() => {
    fetch("/api/create-user");
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
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
  };

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
    category: string;
    type: string;
    accountId: string;
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
      const dayKey = date.toLocaleDateString("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

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
    <ThemeProvider theme={darkTheme}>
      <div className=" min-h-screen">
        <main className="container mx-auto p-8 flex flex-col-reverse md:flex-row gap-24 space-y-10 md:space-y-0 justify-center">
          <div className="flex-grow max-w-[500px]">
            <Tabs.Root
              value={searchParams.get("tab") || "transactions"}
              onValueChange={(value) => {
                router.push(`?${createQueryString("tab", value)}`);
              }}
            >
              <Tabs.List className="mb-4 ">
                <Tabs.Trigger
                  onClick={() => {
                    router.push(`?${createQueryString("tab", "transactions")}`);
                  }}
                  value="transactions"
                >
                  Transactions
                </Tabs.Trigger>
                <Tabs.Trigger
                  onClick={() => {
                    router.push(`?${createQueryString("tab", "goals")}`);
                  }}
                  value="goals"
                >
                  Goals
                </Tabs.Trigger>
                <Tabs.Trigger
                  onClick={() => {
                    router.push(`?${createQueryString("tab", "accounts")}`);
                  }}
                  value="accounts"
                >
                  Accounts
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="goals">
                <GoalsList />
              </Tabs.Content>
              <Tabs.Content value="accounts">
                <div className="flex mb-8 gap-3 items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My accounts
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
                <div className="flex mb-8 gap-3 items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Recent transactions
                  </h1>
                  <AddButton
                    onClick={() => setNewTransactionDialogOpen(true)}
                  />
                </div>
                <div className="grid gap-4 mx-auto">
                  {isLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      Loading transactions...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </div>
                  ) : (
                    Object.entries(groupTransactionsByDay(transactions)).map(
                      ([day, dayTransactions]) => (
                        <div key={day}>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed right-8 bottom-8 md:right-16 md:bottom-16 bg-gray-600 rounded-lg p-3 flex items-center justify-center hover:bg-gray-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
        </button>
        <div
          className={`bottom-30 right-8 ml-8 md:bottom-16 md:right-35 md:w-md transition-all transition-discrete ${
            chatOpen ? "fixed" : "hidden"
          }`}
        >
          <ChatUI
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>

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
    </ThemeProvider>
  );
}
