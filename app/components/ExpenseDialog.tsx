'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: {
    id: string;
    concept: string;
    date: string;
    amount: number;
    category: string;
  };
  onUpdate?: (updatedExpense: {
    id: string;
    concept: string;
    date: string;
    amount: number;
    category: string;
  }) => void;
  onDelete?: (id: string) => void;
}

export default function ExpenseDialog({ open, onOpenChange, expense, onUpdate, onDelete }: ExpenseDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    concept: expense.concept,
    amount: expense.amount.toString(),
    date: new Date(expense.date).toISOString().split('T')[0],
    category: expense.category
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFormData({
      concept: expense.concept,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category
    });
    setShowDeleteConfirm(false);
  }, [expense]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate({
        id: expense.id,
        concept: formData.concept,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(expense.id);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
            <span>Expense Details</span>
            {onDelete && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-600 p-1"
                title="Delete expense"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}
          </Dialog.Title>
          
          {showDeleteConfirm ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Concept</label>
                <input
                  type="text"
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 