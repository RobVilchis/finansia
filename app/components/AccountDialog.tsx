"use client";

import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Wallet, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  updateAccountAction,
  deleteAccountAction,
} from "@/app/actions/accounts";
import {
  GlassDialogShell,
  GlassInput,
  GlassButton,
  FieldLabel,
  FieldError,
  glassDialogContent,
} from "./ui/glass";

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
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: account.name, type: "" },
  });

  const action = handleSubmit(async (formData) => {
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
      onFailed({ title: "Ocurrió un error", message });
    } else {
      onDeleteSuccess();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="420px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>
            {showDeleteConfirm ? "Eliminar cuenta" : "Editar cuenta"}
          </Dialog.Title>
        </VisuallyHidden>

        {showDeleteConfirm ? (
          <GlassDialogShell
            icon={<Trash2 size={16} />}
            title="Eliminar cuenta"
            subtitle="Esta acción no se puede deshacer"
          >
            <p className="text-sm text-white/70 mb-6">
              ¿Estás seguro de que quieres eliminar esta cuenta?
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
            icon={<Wallet size={16} />}
            title="Editar cuenta"
            subtitle="Actualiza el nombre o tipo"
          >
            <form onSubmit={action} className="flex flex-col gap-4">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <GlassInput {...register("name")} />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <FieldLabel>Tipo de cuenta</FieldLabel>
                <GlassInput
                  placeholder="ej. Corriente, Ahorro, Crédito"
                  {...register("type")}
                />
                <FieldError message={errors.type?.message} />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/8 mt-2">
                <GlassButton
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2!"
                  aria-label="Eliminar cuenta"
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
