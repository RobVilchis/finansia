"use client";

import { Dialog, TextField, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Goal, updateGoal } from "@/lib/services/goals";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (open: string) => void;
  goal: Goal;
  onGoalUpdated: () => void;
}

export default function GoalDialog({
  open,
  onOpenChange,
  goal,
  onDelete,
  onGoalUpdated,
}: GoalDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate || "",
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    try {
      await updateGoal({
        id: goal.id,
        ...formData,
      });
      onGoalUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update goal:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Edit Goal</Dialog.Title>
          {!showDeleteConfirm && (
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
              <Button color="red" onClick={() => onDelete(goal.id)}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
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
                Update Goal
              </Button>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
