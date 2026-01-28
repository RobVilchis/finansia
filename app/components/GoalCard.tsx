"use client";

import { Goal } from "@/lib/services/goals";
import { Progress } from "@radix-ui/themes";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal | null) => void;
}

function formatDate(date: Date | string): string {
  // Handle ISO date strings (YYYY-MM-DD) directly to avoid timezone issues
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  }
  // For Date objects or other formats, use UTC methods for consistency
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function GoalCard({ goal, onEdit }: GoalCardProps) {
  return (
    <div
      onClick={() => onEdit(goal)}
      className="p-4 cursor-pointer bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-none hover:shadow-md \
        dark:hover:bg-slate-700 transition-all"
    >
      <div className="flex justify-between items-start w-full">
        <div className=" w-full">
          <div className="space-y-1 flex justify-between">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-100">
              {goal.name}
            </h3>
            {goal.targetDate && (
              <p className=" text-slate-500 dark:text-slate-400">
                Fecha: {formatDate(new Date(goal.targetDate))}
              </p>
            )}
          </div>
          <div className="space-y-3 md:space-y-1 w-full">
            <div className="space-y-1 md:flex justify-between">
              <p className="text-slate-600 dark:text-slate-400">
                ${goal.currentAmount} / ${goal.targetAmount}
              </p>
            </div>
            <Progress
              value={
                (Math.max(Number(goal.currentAmount), 0) /
                  Number(goal.targetAmount)) *
                100
              }
              className="w-full "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
