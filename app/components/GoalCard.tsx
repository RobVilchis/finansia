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
      className="p-4 cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    >
      <div className="flex justify-between items-start w-full">
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-100">
            {goal.name}
          </h3>
          <div className="space-y-3 md:space-y-1 w-full">
            <div className="space-y-1 md:flex justify-between">
              <p className="text-slate-600 dark:text-slate-400">
                Monto: ${goal.targetAmount}
              </p>
              {goal.targetDate && (
                <p className=" text-slate-500 dark:text-slate-400">
                  Fecha: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <Progress
              value={
                (Math.max(Number(goal.currentAmount), 0) /
                  Number(goal.targetAmount)) *
                100
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
