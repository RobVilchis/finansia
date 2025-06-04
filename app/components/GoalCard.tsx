"use client";

import { Goal } from "@/lib/services/goals";
import { Progress } from "@radix-ui/themes";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

export default function GoalCard({ goal, onEdit }: GoalCardProps) {
  return (
    <div
      onClick={() => onEdit(goal)}
      className="p-4 cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start w-full">
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {goal.name}
          </h3>
          <div className="space-y-3 md:space-y-1 w-full">
            <div className="space-y-1 md:flex justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                Target: ${goal.targetAmount}
              </p>
              {goal.targetDate && (
                <p className=" text-gray-500 dark:text-gray-400">
                  Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <Progress
              value={
                (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
