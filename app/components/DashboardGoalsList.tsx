"use client";

import { Goal, deleteGoal, getGoals } from "@/lib/services/goals";
import { useEffect, useState } from "react";
import { AddButton } from "./AddButton";
import GoalCard from "./GoalCard";
import GoalDialog from "./GoalDialog";
import NewGoalDialog from "./NewGoalDialog";

export default function DashboardGoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

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

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      await fetchGoals();
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  if (loading) {
    return <div>Loading goals...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex mb-8 gap-3 items-center justify-between">
        <AddButton
          onClick={() => {
            setGoalDialogOpen(true);
          }}
        />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols md:grid-cols-2 gap-4">
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

      <NewGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onGoalAdded={() => {
          fetchGoals();
        }}
      />
    </div>
  );
}
