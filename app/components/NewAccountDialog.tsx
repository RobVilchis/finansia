"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createAccountAction } from "@/app/actions/accounts";
import { useToast } from "./GenericToast";
import {
  GlassDialogShell,
  GlassInput,
  GlassButton,
  FieldLabel,
  FieldError,
  glassDialogContent,
} from "./ui/glass";

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

export default function NewAccountDialog({
  open,
  onOpenChange,
  onAccountAdded,
}: NewAccountDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", type: "" },
  });

  const { showToast } = useToast();

  const action = handleSubmit(async (formData) => {
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
      showToast({
        title: "Error al crear cuenta",
        message: "No se pudo crear la cuenta. Intenta de nuevo.",
        variant: "error",
      });
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="420px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>Agregar nueva cuenta</Dialog.Title>
        </VisuallyHidden>
        <GlassDialogShell
          icon={<Wallet size={16} />}
          title="Nueva cuenta"
          subtitle="Agrega una cuenta para registrar movimientos"
        >
          <form onSubmit={action} className="flex flex-col gap-4">
            <div>
              <FieldLabel>Nombre</FieldLabel>
              <GlassInput
                placeholder="ej. BBVA Débito, Efectivo..."
                {...register("name")}
              />
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

            <div className="flex justify-end gap-2 pt-4 border-t border-white/8 mt-2">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Agregando..." : "Agregar"}
              </GlassButton>
            </div>
          </form>
        </GlassDialogShell>
      </Dialog.Content>
    </Dialog.Root>
  );
}
