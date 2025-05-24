'use client';

import Navbar from './components/Navbar';
import ExpenseCard from './components/ExpenseCard';
import ChatUI from './components/ChatUI';
import NewExpenseDialog from './components/NewExpenseDialog';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Tabs } from 'radix-ui';

const initialExpenses = [
  {
    concept: "Grocery Shopping",
    date: "2024-03-15",
    amount: 156.78,
    category: "Food & Groceries"
  },
  {
    concept: "Netflix Subscription",
    date: "2024-03-14",
    amount: 15.99,
    category: "Entertainment"
  },
  {
    concept: "Electric Bill",
    date: "2024-03-13",
    amount: 89.50,
    category: "Utilities"
  },
  {
    concept: "Gas Station",
    date: "2024-03-12",
    amount: 45.23,
    category: "Transportation"
  },
  {
    concept: "Restaurant Dinner",
    date: "2024-03-11",
    amount: 68.90,
    category: "Dining Out"
  },
  {
    concept: "Electric Bill",
    date: "2024-03-13",
    amount: 89.50,
    category: "Utilities"
  },
  {
    concept: "Gas Station",
    date: "2024-03-12",
    amount: 45.23,
    category: "Transportation"
  },
  {
    concept: "Restaurant Dinner",
    date: "2024-03-11",
    amount: 68.90,
    category: "Dining Out"
  }
];

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenses, setExpenses] = useState(initialExpenses);

  const handleAddExpense = (newExpense: { concept: string; date: string; amount: number; category: string }) => {
    setExpenses([newExpense, ...expenses]);
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
                {expenses.map((expense, index) => (
                  <ExpenseCard
                    key={index}
                    concept={expense.concept}
                    date={expense.date}
                    amount={expense.amount}
                    category={expense.category}
                  />
                ))}
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
    </div>
  );
}
