"use client";

import { createGoal } from "@/lib/services/goals";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, TextField } from "@radix-ui/themes";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";

interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: () => void;
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

export default function NewGoalDialog({
  open,
  onOpenChange,
  onGoalAdded,
}: NewGoalDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      targetDate: "",
    },
  });

  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

  const onSubmit = async (data: GoalFormData) => {
    try {
      await createGoal({
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate || undefined,
      });
      reset();
      onGoalAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Agregar nueva meta</Dialog.Title>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" color="blue">
              Guardar
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
