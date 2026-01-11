import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  SegmentedControl,
  Switch,
  TextField,
} from "@radix-ui/themes";
import { useEffect } from "react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import z from "zod";

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
  name: z.string().min(1, "Category name is required"),
  budget: z.string().nullable(),
  budgeted: z.boolean(),
  type: z.enum(["expense", "income"]),
});

type FieldProps<T extends keyof CategoryFormData> = {
  field: ControllerRenderProps<CategoryFormData, T>;
};

export default function CategoryDialog({
  open,
  onOpenChange,
  onCategoryAdded,
}: CategoryDialogProps) {
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      budget: null,
      budgeted: false,
      type: "expense",
    },
  });

  // Reset form values when category changes
  useEffect(() => {
    reset({
      name: "",
      budget: null,
      budgeted: false,
      type: "expense",
    });
  }, [reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          budget: Number(data.budget),
        }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      reset();
      onCategoryAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="300px">
        <Dialog.Title>Crear categoría</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Nombre:
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }: FieldProps<"name">) => (
                <TextField.Root value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="mt-6 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Tipo de categoría:
            </label>
            <div className="w-full">
              <Controller
                name="type"
                control={control}
                render={({ field }: FieldProps<"type">) => (
                  <SegmentedControl.Root
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SegmentedControl.Item value="expense">
                      Gastos
                    </SegmentedControl.Item>
                    <SegmentedControl.Item value="income">
                      Ingresos
                    </SegmentedControl.Item>
                  </SegmentedControl.Root>
                )}
              />
            </div>
          </div>
          <div className="mt-6">
            {watch("type") === "expense" && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Asignar presupuesto mensual:
                </label>
                <div className="flex items-center gap-2">
                  <Controller
                    name="budgeted"
                    control={control}
                    render={({ field }: FieldProps<"budgeted">) => (
                      <Switch
                        size="3"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />

                  <div
                    className={`w-full ${
                      watch("budgeted") ? "" : "opacity-70"
                    }`}
                  >
                    <Controller
                      name="budget"
                      control={control}
                      render={({ field }: FieldProps<"budget">) => (
                        <TextField.Root
                          disabled={!watch("budgeted")}
                          type="number"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        >
                          <TextField.Slot>$</TextField.Slot>
                          {/*<TextField.Input type="number" value={field.value || ""} onChange={field.onChange} />*/}
                        </TextField.Root>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" color="blue">
              Aceptar
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
