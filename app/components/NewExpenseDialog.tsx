'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: { concept: string; date: string; amount: number; category: string }) => void;
}

export default function NewExpenseDialog({ open, onOpenChange, onAddExpense }: NewExpenseDialogProps) {
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food & Groceries'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setFormData({
      concept: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Food & Groceries'
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add New Expense
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-gray-900 dark:text-gray-300">
            <div>
              <label className="block text-sm font-medium mb-1">
                Concept
              </label>
              <input
                type="text"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2   focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Food & Groceries">Food & Groceries</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Transportation">Transportation</option>
                <option value="Dining Out">Dining Out</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Expense
              </button>
            </div>
          </form>

          <Dialog.Close className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03157 3.2184C3.80702 2.99385 3.44295 2.99385 3.2184 3.2184C2.99385 3.44295 2.99385 3.80702 3.2184 4.03157L6.68682 7.50005L3.2184 10.9685C2.99385 11.193 2.99385 11.5571 3.2184 11.7816C3.44295 12.0062 3.80702 12.0062 4.03157 11.7816L7.50005 8.31322L10.9685 11.7816C11.193 12.0062 11.5571 12.0062 11.7816 11.7816C12.0062 11.5571 12.0062 11.193 11.7816 10.9685L8.31322 7.50005L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 