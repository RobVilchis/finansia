"use client";

import { Dialog, TextField, Button } from "@radix-ui/themes";
import { useState } from "react";

interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGoal: (goal: { name: string; target: number; current: number }) => void;
}

export default function NewGoalDialog({
  open,
  onOpenChange,
  onAddGoal,
}: NewGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      ...formData,
      target: parseFloat(formData.target),
      current: parseFloat(formData.current),
    });
    setFormData({
      name: "",
      target: "",
      current: "0",
    });
    onOpenChange(false);
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
                value={formData.target}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Current Amount
              </label>
              <TextField.Root
                type="number"
                step="0.01"
                value={formData.current}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, current: e.target.value })
                }
                required
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
