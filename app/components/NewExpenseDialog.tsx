'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: { concept: string; date: string; amount: number; category: string }) => void;
}

export default function NewExpenseDialog({ open, onOpenChange, onAddExpense }: NewExpenseDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      // Set initial category if none selected
      if (!formData.category && data.length > 0) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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
      category: categories[0]?.name || ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none">
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
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 