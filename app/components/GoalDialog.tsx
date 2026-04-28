"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Target, DollarSign, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { updateGoalAction, deleteGoalAction } from "@/app/actions/goals";
import { Goal } from "@/lib/services/goals";
import {
  GlassDialogShell,
  GlassInput,
  GlassButton,
  FieldLabel,
  FieldError,
  glassDialogContent,
} from "./ui/glass";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onDelete: (id: string) => void;
  onGoalUpdated: () => void;
}

const goalSchema = z.object({
  name: z.string().min(1, "El nombre de la meta es requerido"),
  targetAmount: z.string().min(1, "El monto objetivo es requerido"),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export default function GoalDialog({
  open,
  onOpenChange,
  goal,
  onDelete,
  onGoalUpdated,
}: GoalDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate || "",
    },
  });

  const action = handleSubmit(async (formData) => {
    try {
      await updateGoalAction(goal.id, {
        name: formData.name,
        targetAmount: formData.targetAmount,
        targetDate: formData.targetDate || undefined,
      });
      onGoalUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  });

  const handleDelete = async () => {
    try {
      await deleteGoalAction(goal.id);
      onDelete(goal.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="420px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>Editar meta</Dialog.Title>
        </VisuallyHidden>

        {showDeleteConfirm ? (
          <GlassDialogShell
            icon={<Trash2 size={16} />}
            title="Eliminar meta"
            subtitle="Esta acción no se puede deshacer"
          >
            <p className="text-sm text-white/70 mb-6">
              ¿Estás seguro de que quieres eliminar esta meta?
            </p>
            <div className="flex justify-end gap-2">
              <GlassButton
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </GlassButton>
              <GlassButton variant="danger" onClick={handleDelete}>
                Eliminar
              </GlassButton>
            </div>
          </GlassDialogShell>
        ) : (
          <GlassDialogShell
            icon={<Target size={16} />}
            title="Editar meta"
            subtitle="Actualiza tu objetivo de ahorro"
          >
            <form onSubmit={action} className="flex flex-col gap-4">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <GlassInput {...register("name")} />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <FieldLabel>Monto objetivo</FieldLabel>
                <GlassInput
                  leadingIcon={<DollarSign size={16} />}
                  type="number"
                  step="0.01"
                  className="font-mono tabular-nums"
                  {...register("targetAmount")}
                />
                <FieldError message={errors.targetAmount?.message} />
              </div>

              <div>
                <FieldLabel>Fecha objetivo</FieldLabel>
                <GlassInput
                  leadingIcon={<Calendar size={16} />}
                  type="date"
                  {...register("targetDate")}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/8 mt-2">
                <GlassButton
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2!"
                  aria-label="Eliminar meta"
                >
                  <Trash2 size={16} />
                </GlassButton>
                <div className="flex gap-2">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Actualizar"}
                  </GlassButton>
                </div>
              </div>
            </form>
          </GlassDialogShell>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
