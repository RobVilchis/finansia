"use client";

import { Goal } from "@/lib/services/goals";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal | null) => void;
}

function formatDate(date: Date | string): string {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  }
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function GoalCard({ goal, onEdit }: GoalCardProps) {
  const progress = Math.min(
    (Math.max(Number(goal.currentAmount), 0) / Number(goal.targetAmount)) * 100,
    100
  );

  return (
    <div
      onClick={() => onEdit(goal)}
      className="p-4 cursor-pointer bg-white/6 backdrop-blur-md border border-white/10
        rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-white/80">{goal.name}</h3>
        {goal.targetDate && (
          <span className="text-xs text-white/30 shrink-0 ml-2">
            {formatDate(new Date(goal.targetDate))}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/30 font-mono tabular-nums">
            ${goal.currentAmount}
          </span>
          <span className="text-xs text-white/30 font-mono tabular-nums">
            ${goal.targetAmount}
          </span>
        </div>
        {/* Glass progress bar */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400/70 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
