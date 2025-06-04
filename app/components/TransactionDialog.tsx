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

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    id: string;
    concept: string;
    date: string;
    type: string;
    amount: number;
    category: string;
    accountId?: string;
    targetAccountId?: string;
  };
  onUpdate: (transaction: {
    id: string;
    concept: string;
    date: string;
    type: string;
    amount: number;
    category: string;
    accountId: string;
    targetAccountId?: string;
  }) => void;
  onDelete: (id: string) => void;
}

export default function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onUpdate,
  onDelete,
}: TransactionDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    concept: "",
    date: "",
    type: "",
    amount: "",
    category: "",
    accountId: "",
    targetAccountId: "",
  });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
        if (transaction) {
          setFormData((prev) => ({
            ...prev,
            category: transaction.category,
          }));
        }
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
        if (transaction) {
          setFormData((prev) => ({
            ...prev,
            accountId: transaction.accountId || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchCategories();
    fetchAccounts();
  }, [transaction]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        concept: transaction.concept,
        date: new Date(transaction.date).toISOString().split("T")[0],
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        accountId: transaction.accountId || "",
        targetAccountId: transaction.targetAccountId || "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      id: transaction.id,
      concept: formData.concept,
      date: formData.date,
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category,
      accountId: formData.accountId,
      targetAccountId:
        formData.type === "transfer" ? formData.targetAccountId : undefined,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Edit Transaction</Dialog.Title>
          <Button
            variant="soft"
            color="red"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => {
                  onDelete(transaction.id);
                  onOpenChange(false);
                }}
              >
                Delete Transaction
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
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
                  {accounts.map((account) => (
                    <Select.Item key={account.id} value={account.id}>
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
                      .map((account) => (
                        <Select.Item key={account.id} value={account.id}>
                          {account.name} (${account.balance})
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select.Root>
              </div>
            )}

            {formData.type !== "transfer" && (
              <div>
                <label className="text-sm w-full font-medium text-gray-700 dark:text-gray-300 mb-1 block">
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
                Update Transaction
              </Button>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
