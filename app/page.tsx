'use client';

import Navbar from './components/Navbar';
import ExpenseCard from './components/ExpenseCard';
import ChatUI from './components/ChatUI';
import NewExpenseDialog from './components/NewExpenseDialog';
import ExpenseDialog from './components/ExpenseDialog';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { Tabs } from "@radix-ui/themes";

interface Expense {
  id: string;
  concept: string;
  date: string;
  amount: number;
  categoryName: string;
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (newExpense: { concept: string; date: string; amount: number; category: string }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) throw new Error('Failed to add expense');
      
      // Refresh expenses list
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleUpdateExpense = async (updatedExpense: { id: string; concept: string; date: string; amount: number; category: string }) => {
    try {
      const response = await fetch(`/api/expenses`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExpense),
      });

      if (!response.ok) throw new Error('Failed to update expense');
      
      // Refresh expenses list
      fetchExpenses();
      setExpenseDialogOpen(false);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete expense');
      
      // Refresh expenses list
      fetchExpenses();
      setExpenseDialogOpen(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="relative container mx-auto px-4 py-8 md:flex gap-24 space-y-10 md:space-y-0 justify-center">
        <div className="w-1/3 mr-6">
          <Tabs.Root defaultValue="Expenses">
            <Tabs.List className="mb-4">
              <Tabs.Trigger value="Expenses">Expenses</Tabs.Trigger>
              <Tabs.Trigger value="Goals">Goals</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="Goals">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-8 bg-gray-100 border-2 border-gray-300 dark:bg-gray-700 px-5 py-3 rounded-md h-min">
                <h1>My Goals</h1>
                <div className='text-lg opacity-70'>
                  <li>A</li>
                  <li>B</li>
                  <li>C</li>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="Expenses">
              <div className='flex mb-8 gap-3 items-center justify-between'>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Expenses
                </h1>
                <button 
                  onClick={() => setDialogOpen(true)} 
                  className='border-2 border-neutral-300 py-1 px-2 rounded-md opacity-70 hover:opacity-80'
                >
                  Add New Expense
                </button>
              </div>
              <div className="grid gap-4 mx-auto">
                {isLoading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">No expenses found</div>
                ) : (
                  expenses.map((expense) => (
                    <div key={expense.id} onClick={() => handleExpenseClick(expense)}>
                      <ExpenseCard
                        concept={expense.concept}
                        date={new Date(expense.date).toLocaleDateString()}
                        amount={Number(expense.amount)}
                        category={expense.categoryName}
                      />
                    </div>
                  ))
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <div className="w-1/3"></div>
        <div className="w-1/3 block md:fixed right-36">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            AI Assistant
          </h2>
          <ChatUI
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </main>

      <NewExpenseDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddExpense={handleAddExpense}
      />

      {selectedExpense && (
        <ExpenseDialog
          open={expenseDialogOpen}
          onOpenChange={setExpenseDialogOpen}
          expense={{
            id: selectedExpense.id,
            concept: selectedExpense.concept,
            date: selectedExpense.date,
            amount: Number(selectedExpense.amount),
            category: selectedExpense.categoryName
          }}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  );
}
