"use client";

import { Dialog, TextField, Select, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";

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

export default function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  onUpdate,
  onDelete,
}: ExpenseDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    concept: expense.concept,
    amount: expense.amount.toString(),
    date: new Date(expense.date).toISOString().split("T")[0],
    time: new Date(expense.date).toISOString().split("T")[1].slice(0, 5),
    category: expense.category,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFormData({
      concept: expense.concept,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split("T")[0],
      time: new Date(expense.date).toISOString().split("T")[1].slice(0, 5),
      category: expense.category,
    });
    setShowDeleteConfirm(false);
  }, [expense]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate({
        id: expense.id,
        concept: formData.concept,
        amount: parseFloat(formData.amount),
        date: `${formData.date} ${formData.time}:00`,
        category: formData.category,
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
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title className="flex justify-between">
            Expense Details
          </Dialog.Title>
          {onDelete && !showDeleteConfirm && (
            <Button
              variant="ghost"
              color="red"
              onClick={() => setShowDeleteConfirm(true)}
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
            </Button>
          )}
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button color="red" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Concept
                </label>
                <TextField.Root
                  value={formData.concept}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Amount
                </label>
                <TextField.Root
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Date
                </label>
                <TextField.Root
                  type="date"
                  value={formData.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Time
                </label>
                <TextField.Root
                  type="time"
                  value={formData.time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Category
                </label>
                <Select.Root
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    {categories.map((category, i) => (
                      <Select.Item key={i} value={category.name}>
                        {category.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="submit" color="blue">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
