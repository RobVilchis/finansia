"use client";

import {
  Button,
  Dialog,
  SegmentedControl,
  Select,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";

interface Category {
  name: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: {
    concept: string;
    date: string;
    amount: number;
    category: string;
    accountId: string;
    type: string;
    targetAccountId?: string;
  }) => void;
}

export default function NewTransactionDialog({
  open,
  onOpenChange,
  onAddExpense,
}: NewTransactionDialogProps) {
  const [formData, setFormData] = useState({
    concept: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "",
    type: "expense",
    accountId: "",
    targetAccountId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) throw new Error("Failed to fetch accounts");
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchCategories();
    fetchAccounts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      concept: formData.concept,
      date: formData.date,
      amount: Number(formData.amount),
      category: formData.category,
      accountId: formData.accountId,
      type: formData.type,
      targetAccountId:
        formData.type === "transfer" ? formData.targetAccountId : undefined,
    });
    setFormData({
      concept: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      category: "",
      type: "expense",
      accountId: "",
      targetAccountId: "",
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Add New Transaction</Dialog.Title>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Transaction Type
            </label>
            <SegmentedControl.Root
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SegmentedControl.Item value="expense">
                Expense
              </SegmentedControl.Item>
              <SegmentedControl.Item value="income">
                Income
              </SegmentedControl.Item>
              <SegmentedControl.Item value="transfer">
                Transfer
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Description
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
              {formData.type === "expense"
                ? "Source Account"
                : formData.type === "income"
                ? "Target Account"
                : "Source Account"}
            </label>
            <Select.Root
              value={formData.accountId}
              onValueChange={(value) =>
                setFormData({ ...formData, accountId: value })
              }
            >
              <Select.Trigger />
              <Select.Content>
                {accounts.map((account, i) => (
                  <Select.Item key={i} value={account.id}>
                    {account.name} (${account.balance})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          {formData.type === "transfer" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Target Account
              </label>
              <Select.Root
                value={formData.targetAccountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetAccountId: value })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  {accounts
                    .filter((account) => account.id !== formData.accountId)
                    .map((account, i) => (
                      <Select.Item key={i} value={account.id}>
                        {account.name} (${account.balance})
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select.Root>
            </div>
          )}

          {formData.type !== "transfer" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Category
              </label>
              <Select.Root
                value={formData.category}
                onValueChange={(value) => {
                  console.log(value);
                  setFormData({ ...formData, category: value });
                }}
              >
                <Select.Trigger />
                <Select.Content>
                  {categories.map((category, i) => (
                    <div key={i}>
                      <Select.Item value={category.name}>
                        {category.name}
                      </Select.Item>
                    </div>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" color="blue">
              Add Transaction
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
