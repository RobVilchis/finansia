"use client";

import { Select, Dialog, TextField, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: {
    concept: string;
    date: string;
    amount: number;
    category: string;
  }) => void;
}

export default function NewExpenseDialog({
  open,
  onOpenChange,
  onAddExpense,
}: NewExpenseDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
        // Set initial category if none selected
        if (!formData.category && data.length > 0) {
          setFormData((prev) => ({ ...prev, category: data[0].name }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [formData.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setFormData({
      concept: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: categories[0]?.name || "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth={"400px"}>
        <Dialog.Title>Add New Expense</Dialog.Title>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-gray-900 dark:text-gray-300"
        >
          <div className="flex flex-col gap-5 ">
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
                Category
              </label>
              <Select.Root
                defaultValue="Food"
                onValueChange={(e) => setFormData({ ...formData, category: e })}
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
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" color="blue">
              Add expense
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
