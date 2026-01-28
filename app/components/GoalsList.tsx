"use client";

import { deleteGoal, Goal } from "@/lib/services/goals";
import { useState } from "react";
import { AddButton } from "./AddButton";
import { useToast } from "./GenericToast";
import GoalCard from "./GoalCard";
import GoalDialog from "./GoalDialog";
import NewGoalDialog from "./NewGoalDialog";

export default function GoalsList({ goals }: { goals: Goal[] }) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      showToast({
        title: "Meta eliminada con éxito",
        message: "",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete goal:", err);
      // You might want to show an error message to the user here
      showToast({
        title: "Ocurrió un error",
        message: "",
        variant: "error",
      });
    }
  };

  return (
    <div>
      <div className="flex mb-8 gap-3 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Metas
        </h1>
        <AddButton
          onClick={() => {
            setGoalDialogOpen(true);
          }}
        />
      </div>
      <div className="space-y-4">
        <div className="grid gap-4">
          {goals.map((goal, i) => (
            <GoalCard key={i} goal={goal} onEdit={setEditingGoal} />
          ))}
        </div>
        {editingGoal && (
          <GoalDialog
            open={!!editingGoal}
            onOpenChange={(open) => !open && setEditingGoal(null)}
            goal={editingGoal}
            onDelete={handleDelete}
            onGoalUpdated={() =>
              showToast({
                title: "Meta actualizada con éxito",
                message: "",
                variant: "info",
              })
            } // TODO: refech
          />
        )}
      </div>

      <NewGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onGoalAdded={() =>
          showToast({
            title: "Meta agregada con éxito",
            message: "",
            variant: "success",
          })
        } // TODO: refetch
      />
    </div>
  );
}
