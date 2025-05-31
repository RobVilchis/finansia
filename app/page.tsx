"use client";

import { useChat } from "@ai-sdk/react";
import { Box, Flex, Popover, Tabs, Checkbox } from "@radix-ui/themes";
import { use, useEffect, useState } from "react";
import { AddButton } from "./components/AddButton";
import ChatUI from "./components/ChatUI";
import TransactionCard from "./components/ExpenseCard";
import ExpenseDialog from "./components/ExpenseDialog";
import { GoalCard } from "./components/GoalCard";
import NewExpenseDialog from "./components/NewExpenseDialog";

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  categoryName: string;
  type: string;
  sourceAccountName: string;
  targetAccountName: string;
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

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
      console.error("Error fetching trzansactions:", error);
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
  }) => {
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
  }) => {
    try {
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
      setTransactionDialogOpen(false);
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDialogOpen(true);
  };

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

  return (
    <div className="relative min-h-screen">
      <main className="container mx-auto px-4 py-8 flex flex-col-reverse md:flex-row gap-24 space-y-10 md:space-y-0 justify-center">
        <div className="mr-6">
          <Tabs.Root defaultValue="Expenses" className="w-full">
            <Tabs.List className="mb-4">
              <Tabs.Trigger value="Expenses">Expenses</Tabs.Trigger>
              <Tabs.Trigger value="Goals">Goals</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="Goals">
              <div className="flex mb-8 gap-3 items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Goals
                </h1>
                <AddButton onClick={() => {}}></AddButton>
              </div>
              <div className="flex flex-col gap-3">
                <GoalCard
                  name={"New car"}
                  target={150000}
                  current={36000}
                ></GoalCard>
                <GoalCard
                  name={"Retirement"}
                  target={1500000}
                  current={100000}
                ></GoalCard>
              </div>
            </Tabs.Content>
            <Tabs.Content value="Expenses">
              <div className="flex mb-8 gap-3 items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Transactions
                </h1>
                <AddButton onClick={() => setDialogOpen(true)}></AddButton>
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
                  Object.entries(groupTransactionsByDay(transactions))
                    .sort(
                      ([a], [b]) =>
                        new Date(b).getTime() - new Date(a).getTime()
                    )
                    .map(([dayKey, dayTransactions]) => (
                      <div key={dayKey} className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {dayKey}
                        </h2>
                        <div className="space-y-3">
                          {dayTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              onClick={() =>
                                handleTransactionClick(transaction)
                              }
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
                    ))
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* <div className="w-md"></div> */}
      </main>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed right-8 bottom-8 md:right-16 md:bottom-16 bg-blue-700 rounded-full p-3 flex items-center justify-center hover:bg-blue-800 transition-colors"
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
        onOpenChange={setDialogOpen}
        onAddExpense={(expense) =>
          handleAddTransaction({
            description: expense.concept,
            date: expense.date,
            amount: expense.amount,
            category: expense.category,
            type: "expense", // Default to expense type for now
          })
        }
      />

      {selectedTransaction && (
        <ExpenseDialog
          open={transactionDialogOpen}
          onOpenChange={setTransactionDialogOpen}
          expense={{
            id: selectedTransaction.id,
            concept: selectedTransaction.description,
            date: selectedTransaction.date,
            amount: Number(selectedTransaction.amount),
            category: selectedTransaction.categoryName,
          }}
          onUpdate={(expense) =>
            handleUpdateTransaction({
              id: expense.id,
              description: expense.concept,
              date: expense.date,
              amount: expense.amount,
              category: expense.category,
              type: selectedTransaction.type, // Preserve the original type
            })
          }
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}
