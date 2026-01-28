"use client";

import { Button, Dialog, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";
import {
  updateAccountAction,
  deleteAccountAction,
} from "@/app/actions/accounts";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: {
    id: string;
    name: string;
  };
  onDeleteSuccess: () => void;
  onFailed: (payload: { title: string; message: string }) => void;
  onAccountUpdated: () => void;
}

const accountSchema = z.object({
  name: z.string().min(1, "El nombre de la cuenta es requerido"),
  type: z.string().min(1, "El tipo de cuenta es requerido"),
});

type AccountFormData = z.infer<typeof accountSchema>;

type FieldProps = {
  field: ControllerRenderProps<AccountFormData, keyof AccountFormData>;
};

export default function AccountDialog({
  open,
  onOpenChange,
  account,
  onDeleteSuccess,
  onFailed,
  onAccountUpdated,
}: AccountDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      type: "",
    },
  });

  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

  const action: () => void = handleSubmit(async (formData) => {
    try {
      await updateAccountAction(account.id, {
        name: formData.name,
        type: formData.type,
      });
      onAccountUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update account:", error);
    }
  });

  const handleDelete = async () => {
    const { success, message } = await deleteAccountAction(account.id);
    onOpenChange(false);

    if (!success) {
      onFailed({ title: "Ocurrió un error", message: message });
    } else {
      onDeleteSuccess();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="mb-2">
          <Dialog.Title>
            {showDeleteConfirm ? "Eliminar cuenta" : "Editar cuenta"}{" "}
          </Dialog.Title>
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no
              se puede deshacer.
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
                Eliminar cuenta
              </Button>
            </div>
          </div>
        ) : (
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              {!showDeleteConfirm && (
                <Button
                  variant="ghost"
                  color="gray"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Eliminar cuenta"
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
              )}

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
