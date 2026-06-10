"use client";

import { Goal, deleteGoal, getGoals } from "@/lib/services/goals";
import { useEffect, useState } from "react";
import { Plus, Target } from "lucide-react";
import { AddButton } from "./AddButton";
import GoalCard from "./GoalCard";
import GoalDialog from "./GoalDialog";
import NewGoalDialog from "./NewGoalDialog";
import { TextSkeleton } from "./LoadingSkeleton";
import { useToast } from "./GenericToast";
import { GlassButton } from "./ui/glass";
import { EmptyState, ErrorState } from "./ui/states";

export default function DashboardGoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const { showToast } = useToast();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError("Ocurrió un error al cargar tus metas");
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
      console.error("Ocurrió un error al eliminar la meta:", err);
      showToast({
        title: "No se pudo eliminar la meta",
        message: "Intenta de nuevo.",
        variant: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <TextSkeleton lines={3} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        compact
        message="No se pudieron cargar tus metas."
        onRetry={fetchGoals}
      />
    );
  }

  return (
    <div>
      {goals.length > 0 && (
        <div className="flex mb-8 gap-3 items-center justify-between">
          <AddButton
            onClick={() => {
              setGoalDialogOpen(true);
            }}
          />
        </div>
      )}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <EmptyState
            compact
            icon={<Target size={18} />}
            title="Aún no tienes metas"
            description="Crea tu primera meta de ahorro."
            action={
              <GlassButton
                variant="secondary"
                onClick={() => setGoalDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus size={14} />
                Crear meta
              </GlassButton>
            }
          />
        ) : (
          <div className="grid grid-cols md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} />
            ))}
          </div>
        )}
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
