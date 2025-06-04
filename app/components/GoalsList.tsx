"use client";

import { useState, useEffect } from "react";
import { Goal, getGoals, deleteGoal } from "@/lib/services/goals";
import GoalDialog from "./GoalDialog";
import GoalCard from "./GoalCard";

interface GoalsListProps {
  onGoalAdded: () => void;
}

export default function GoalsList({ onGoalAdded }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch goals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [onGoalAdded]);

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      await fetchGoals();
    } catch (err) {
      console.error("Failed to delete goal:", err);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return <div>Loading goals...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} />
        ))}
      </div>
      {editingGoal && (
        <GoalDialog
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
          goal={editingGoal}
          onDelete={handleDelete}
          onGoalUpdated={fetchGoals}
        />
      )}
    </div>
  );
}
