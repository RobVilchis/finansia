"use client";

import { Dialog, TextField, Button } from "@radix-ui/themes";
import { useState } from "react";

interface NewAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: () => void;
}

export default function NewAccountDialog({
  open,
  onOpenChange,
  onAccountAdded,
}: NewAccountDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create account");

      setFormData({
        name: "",
        type: "",
      });
      onAccountAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Add New Account</Dialog.Title>
        </div>

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
              Add Account
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
