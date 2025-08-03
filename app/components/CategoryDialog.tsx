import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import z from "zod";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    name: string;
    type: string;
  };
  onDelete: (id: string) => void;
  onCategoryUpdated: () => void;
}

interface Category {
  name: string;
  type: string;
}

interface CategoryFormData {
  name: string;
  budget: number | null;
}

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  budget: z.number().nullable(),
});

type FieldProps<T extends keyof CategoryFormData> = {
  field: ControllerRenderProps<CategoryFormData, T>;
};

export default function CategoryDialog({
  category,
  open,
  onOpenChange,
}: CategoryDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name,
      budget: 0,
    },
  });

  // Reset form values when category changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        budget: 0,
      });
    }
  }, [category, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>{category.name}</Dialog.Title>
        <form>
          <Controller
            name="name"
            control={control}
            render={({ field }: FieldProps<"name">) => (
              <TextField.Root value={field.value} onChange={field.onChange} />
            )}
          />
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
