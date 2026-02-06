"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  Flex,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTransactionAction } from "../actions/transactions";
import { useToast } from "./GenericToast";
import { TransactionFormData, transactionSchema } from "./TransactionDialog";
import TransactionForm, { Account, Category } from "./TransactionForm";

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
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) throw new Error("Failed to fetch accounts");
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchCategories();
    fetchAccounts();
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
        // style={{ maxWidth: 520, overflow: "visible" }}
        minWidth="10px"
        className="z-40 p-0! rounded-2xl! bg-white! dark:bg-zinc-900! shadow-xl"
      >
        <VisuallyHidden>
          <Dialog.Title>Nueva transacción</Dialog.Title>
        </VisuallyHidden>
        {/* Header */}
        <div className="bg-linear-to-r bg-slate-600 px-6 py-4 rounded-t-2xl text-white">
          <Flex align="center" gap="3" className="mb-2">
            <div className={`p-1 rounded-full bg-white/20 backdrop-blur-sm`}>
              <Plus size={24} className="text-white" />
            </div>

            <div className="text-xl font-bold m-0 text-white">
              Nueva transacción
            </div>
          </Flex>
          <Text size="2" className="text-blue-100 opacity-90">
            Registra un nuevo movimiento en tus cuentas.
          </Text>
        </div>

        <div className="p-6">
          <TransactionForm
            form={form}
            categories={categories}
            accounts={accounts}
            onSubmit={action}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            submitLabel="Guardar transacción"
          />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
