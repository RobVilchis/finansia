"use client";

import { createGoalAction } from "@/app/actions/goals";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Target, DollarSign, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  GlassDialogShell,
  GlassInput,
  GlassButton,
  FieldLabel,
  FieldError,
  glassDialogContent,
} from "./ui/glass";

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

export type GoalFormData = z.infer<typeof goalSchema>;

export default function NewGoalDialog({
  open,
  onOpenChange,
  onGoalAdded,
}: NewGoalDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      targetDate: "",
    },
  });

  const action = handleSubmit(async (formData) => {
    try {
      await createGoalAction({
        name: formData.name,
        targetAmount: formData.targetAmount,
        targetDate: formData.targetDate || undefined,
      });
      reset();
      onGoalAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="420px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>Agregar nueva meta</Dialog.Title>
        </VisuallyHidden>
        <GlassDialogShell
          icon={<Target size={16} />}
          title="Nueva meta"
          subtitle="Define un objetivo de ahorro"
        >
          <form onSubmit={action} className="flex flex-col gap-4">
            <div>
              <FieldLabel>Nombre</FieldLabel>
              <GlassInput
                placeholder="ej. Vacaciones, Enganche..."
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <FieldLabel>Monto objetivo</FieldLabel>
              <GlassInput
                leadingIcon={<DollarSign size={16} />}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="font-mono tabular-nums"
                {...register("targetAmount")}
              />
              <FieldError message={errors.targetAmount?.message} />
            </div>

            <div>
              <FieldLabel>Fecha objetivo (opcional)</FieldLabel>
              <GlassInput
                leadingIcon={<Calendar size={16} />}
                type="date"
                {...register("targetDate")}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/8 mt-2">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear meta"}
              </GlassButton>
            </div>
          </form>
        </GlassDialogShell>
      </Dialog.Content>
    </Dialog.Root>
  );
}
