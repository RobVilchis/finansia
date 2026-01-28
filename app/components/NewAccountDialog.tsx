"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, TextField } from "@radix-ui/themes";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { createAccountAction } from "@/app/actions/accounts";

interface NewAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: () => void;
}

const accountSchema = z.object({
  name: z.string().min(1, "El nombre de la cuenta es requerido"),
  type: z.string().min(1, "El tipo de cuenta es requerido"),
});

export type AccountFormData = z.infer<typeof accountSchema>;

type FieldProps = {
  field: ControllerRenderProps<AccountFormData, keyof AccountFormData>;
};

export default function NewAccountDialog({
  open,
  onOpenChange,
  onAccountAdded,
}: NewAccountDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

  const action: () => void = handleSubmit(async (formData) => {
    try {
      await createAccountAction({
        name: formData.name,
        type: formData.type,
      });
      reset();
      onAccountAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Agregar nueva cuenta</Dialog.Title>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Nombre de la cuenta
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
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Tipo de cuenta
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField.Root
                  size={size}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="ej., Corriente, Ahorro, Tarjeta de crédito"
                />
              )}
            />
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" color="blue">
              Agregar cuenta
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
