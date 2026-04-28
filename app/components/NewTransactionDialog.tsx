"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTransactionAction } from "../actions/transactions";
import { useToast } from "./GenericToast";
import { TransactionFormData, transactionSchema } from "./TransactionDialog";
import TransactionForm, { Account, Category } from "./TransactionForm";
import { GlassDialogShell, glassDialogContent } from "./ui/glass";

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: () => void;
}

export default function NewTransactionDialog({
  open,
  onOpenChange,
  onAddTransaction: onActionFinished,
}: NewTransactionDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { showToast } = useToast();

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
  const timeString = currentDate.toTimeString().slice(0, 5);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      date: dateString,
      time: timeString,
      amount: "",
      category: "",
      type: "expense",
      sourceAccountId: "",
      targetAccountId: "",
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = form;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
    fetch("/api/accounts")
      .then((r) => r.json())
      .then(setAccounts)
      .catch(console.error);
  }, []);

  const action = handleSubmit(async (formData) => {
    const result = await createTransactionAction({
      ...formData,
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
    });

    if (result.success) {
      showToast({
        title: "Transacción exitosa",
        message: "La transacción se ha registrado correctamente.",
        variant: "success",
      });
      reset();
    } else {
      showToast({
        title: "Error",
        message: result.message,
        variant: "error",
      });
    }
    onActionFinished();
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        minWidth="10px"
        maxWidth="520px"
        className={glassDialogContent}
      >
        <VisuallyHidden>
          <Dialog.Title>Nueva transacción</Dialog.Title>
        </VisuallyHidden>
        <GlassDialogShell
          icon={<Plus size={18} />}
          title="Nueva transacción"
          subtitle="Registra un nuevo movimiento"
        >
          <TransactionForm
            form={form}
            categories={categories}
            accounts={accounts}
            onSubmit={action}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            submitLabel="Guardar"
          />
        </GlassDialogShell>
      </Dialog.Content>
    </Dialog.Root>
  );
}
