"use client";

import { Button, Dialog, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { updateGoalAction, deleteGoalAction } from "@/app/actions/goals";
import { Goal } from "@/lib/services/goals";

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

type FieldProps = {
  field: ControllerRenderProps<GoalFormData, keyof GoalFormData>;
};

export default function GoalDialog({
  open,
  onOpenChange,
  goal,
  onDelete,
  onGoalUpdated,
}: GoalDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate || "",
    },
  });
  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

  const action: () => void = handleSubmit(async (formData) => {
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
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Editar meta</Dialog.Title>
        </div>
        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que quieres eliminar esta meta? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button color="red" onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nombre de la meta
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <TextField.Root
                      size={size}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Monto objetivo
                </label>
                <Controller
                  name="targetAmount"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <TextField.Root
                      size={size}
                      type="number"
                      step="0.01"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.targetAmount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.targetAmount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Fecha objetivo
                </label>
                <Controller
                  name="targetDate"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <TextField.Root
                      size={size}
                      type="date"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
            <div className="flex justify-between items-center  mt-6">
              <Button
                variant="ghost"
                color="gray"
                onClick={() => setShowDeleteConfirm(true)}
                title="Eliminar meta"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="24"
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

              <div className="flex justify-end gap-3">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button type="submit" color="blue">
                  Actualizar
                </Button>
              </div>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
