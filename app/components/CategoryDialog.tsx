"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { FolderPlus, DollarSign } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  GlassDialogShell,
  GlassInput,
  GlassButton,
  GlassSegmented,
  FieldLabel,
  FieldError,
  glassDialogContent,
} from "./ui/glass";
import { useToast } from "./GenericToast";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: () => void;
}

interface CategoryFormData {
  name: string;
  budget: string | null;
  budgeted: boolean;
  type: "expense" | "income";
}

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  budget: z.string().nullable(),
  budgeted: z.boolean(),
  type: z.enum(["expense", "income"]),
});

export default function CategoryDialog({
  open,
  onOpenChange,
  onCategoryAdded,
}: CategoryDialogProps) {
  const { showToast } = useToast();
  const {
    control,
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      budget: null,
      budgeted: false,
      type: "expense",
    },
  });

  useEffect(() => {
    reset({ name: "", budget: null, budgeted: false, type: "expense" });
  }, [reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, budget: Number(data.budget) }),
      });
      if (!response.ok) throw new Error("Failed to create category");
      reset();
      onCategoryAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create category:", error);
      showToast({
        title: "No se pudo crear la categoría",
        message: "Intenta de nuevo.",
        variant: "error",
      });
    }
  };

  const type = watch("type");
  const budgeted = watch("budgeted");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="420px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>Crear categoría</Dialog.Title>
        </VisuallyHidden>
        <GlassDialogShell
          icon={<FolderPlus size={16} />}
          title="Crear categoría"
          subtitle="Organiza tus gastos e ingresos"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <FieldLabel>Nombre</FieldLabel>
              <GlassInput
                placeholder="ej. Comida, Transporte..."
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <FieldLabel>Tipo</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <GlassSegmented
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "expense", label: "Gasto" },
                      { value: "income", label: "Ingreso" },
                    ]}
                  />
                )}
              />
            </div>

            {type === "expense" && (
              <div>
                <FieldLabel>Presupuesto mensual</FieldLabel>
                <div className="flex items-center gap-3">
                  <Controller
                    name="budgeted"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={field.value}
                        onClick={() => field.onChange(!field.value)}
                        className={`relative w-10 h-6 rounded-full border transition-colors shrink-0 cursor-pointer ${field.value
                          ? "bg-cyan-500/30 border-cyan-400/40"
                          : "bg-white/6 border-white/10"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${field.value
                            ? "-translate-x-0.5 bg-cyan-300"
                            : "-translate-x-4.5 bg-white/40"
                            }`}
                        />
                      </button>
                    )}
                  />
                  <div className={`flex-1 transition-opacity ${budgeted ? "" : "opacity-40"}`}>
                    <GlassInput
                      leadingIcon={<DollarSign size={16} />}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={!budgeted}
                      className="font-mono tabular-nums"
                      {...register("budget")}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-white/8 mt-2">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary">
                Crear
              </GlassButton>
            </div>
          </form>
        </GlassDialogShell>
      </Dialog.Content>
    </Dialog.Root>
  );
}
