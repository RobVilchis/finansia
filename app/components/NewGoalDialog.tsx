"use client";

import { Dialog, TextField, Button } from "@radix-ui/themes";
import { useState } from "react";
import { createGoal } from "@/lib/services/goals";

interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: () => void;
}

export default function NewGoalDialog({
  open,
  onOpenChange,
  onGoalAdded,
}: NewGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      setFormData({
        name: "",
        targetAmount: "",
        targetDate: "",
      });
      onGoalAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Add New Goal</Dialog.Title>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Goal Name
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
                Target Amount
              </label>
              <TextField.Root
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Target Date
              </label>
              <TextField.Root
                type="date"
                value={formData.targetDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" color="blue">
              Add Goal
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
