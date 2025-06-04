"use client";

import { Dialog, TextField, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";

interface Account {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  balance: number;
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onDelete: (id: string) => void;
  onAccountUpdated: () => void;
}

export default function AccountDialog({
  open,
  onOpenChange,
  account,
  onDelete,
  onAccountUpdated,
}: AccountDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type || "",
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      const response = await fetch(`/api/accounts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: account.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to update account");
      onAccountUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update account:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Edit Account</Dialog.Title>
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
              Are you sure you want to delete this account? This action cannot
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
              <Button
                color="red"
                onClick={() => {
                  if (account) {
                    onDelete(account.id);
                    onOpenChange(false);
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Account Name
              </label>
              <TextField.Root
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Account Type
              </label>
              <TextField.Root
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="e.g., Checking, Savings, Credit Card"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" color="blue">
                Update Account
              </Button>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
