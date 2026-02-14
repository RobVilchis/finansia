"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  Flex,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  deleteTransactionAction,
  updateTransactionAction,
} from "../actions/transactions";
import { Transaction } from "../data/DataDashboard";
import { useToast } from "./GenericToast";
import TransactionForm, { Account, Category } from "./TransactionForm";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Omit<Transaction, "sourceAccountName" | "targetAccountName">;
  onUpdate: () => void;
  onDelete: () => void;
}

export const transactionSchema = z
  .object({
    description: z.string().min(1, "La descripción es requerida").nullable(),
    date: z.string().min(10, "La fecha es requerida"),
    time: z.string().min(4, "La hora es requerida"),
    amount: z.string().min(1, "El monto es requerido"),
    category: z.string().optional(),
    type: z.string(),
    sourceAccountId: z.string().optional(),
    targetAccountId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "expense") {
        return !!data.sourceAccountId;
      }
      return true;
    },
    {
      message: "La cuenta origen es requerida para gastos",
      path: ["sourceAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "income") {
        return !!data.targetAccountId;
      }
      return true;
    },
    {
      message: "La cuenta destino es requerida para ingresos",
      path: ["targetAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "transfer") {
        return !!data.sourceAccountId && !!data.targetAccountId;
      }
      return true;
    },
    {
      message:
        "Ambas cuentas origen y destino son requeridas para transferencias",
      path: ["sourceAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type !== "transfer") {
        return !!data.category;
      }
      return true;
    },
    {
      message: "La categoría es requerida para gastos e ingresos",
      path: ["category"],
    }
  );

export type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onUpdate,
  onDelete: onActionFinished,
}: TransactionDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { showToast } = useToast();

  const transactionDate = new Date(transaction.date);
  const year = transactionDate.getFullYear();
  const month = String(transactionDate.getMonth() + 1).padStart(2, "0");
  const day = String(transactionDate.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
  const timeString = transactionDate.toTimeString().slice(0, 5);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction.description,
      date: dateString,
      time: timeString,
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.categoryName || "",
      sourceAccountId: transaction.sourceAccountId || "",
      targetAccountId: transaction.targetAccountId || "",
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = form;

  useEffect(() => {
    reset({
      description: transaction.description,
      date: dateString,
      time: timeString,
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.categoryName || "",
      sourceAccountId: transaction.sourceAccountId || "",
      targetAccountId: transaction.targetAccountId || "",
    });
  }, [transaction, dateString, timeString, reset]);

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
    const result = await updateTransactionAction(transaction.id, {
      ...formData,
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      isUnverified: false,
    });

    if (result.success) {
      showToast({
        title: "Transacción actualizada con éxito",
        message: "",
        variant: "info",
      });
    } else {
      showToast({
        title: "Ocurrió un error",
        message: result.message,
        variant: "error",
      });
    }

    onUpdate();
  });

  const handleDeleteTransaction = async () => {
    setShowDeleteConfirm(false);

    const result = await deleteTransactionAction(transaction.id);
    onActionFinished();

    if (result.success) {
      showToast({
        title: "Transacción eliminada con éxito",
        message: "",
        variant: "info",
      });
    } else {
      showToast({
        title: "Ocurrió un error",
        message: result.message,
        variant: "error",
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{ maxWidth: 500, overflow: "visible" }}
        className="z-40 p-0! rounded-2xl! bg-white! dark:bg-zinc-900! shadow-xl"
      >
        {/* Header */}
        <VisuallyHidden>
          <Dialog.Title>Editar transacción</Dialog.Title>
        </VisuallyHidden>
        {/* Header */}
        <div className="bg-linear-to-r bg-slate-600 px-6 py-4 rounded-t-2xl text-white">
          <Flex align="center" gap="3" className="mb-2">
            <div className={`p-2 rounded-full bg-white/20 backdrop-blur-sm`}>
              <Edit2 size={16} className="text-white" />
            </div>

            <div className="text-xl font-bold m-0 text-white">
              Editar transacción
            </div>
          </Flex>
          <Text size="2" className="text-blue-100 opacity-90">
            Modifica los detalles de esta transacción.
          </Text>
        </div>

        <div className="p-6">
          <TransactionForm
            form={form}
            categories={categories}
            accounts={accounts}
            onSubmit={action}
            onCancel={() => onOpenChange(false)}
            submitLabel="Actualizar"
            isSubmitting={isSubmitting}
            extraActions={
              <Button
                type="button"
                variant="soft"
                color="crimson"
                size="3"
                onClick={() => setShowDeleteConfirm(true)}
                className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={18} />
              </Button>
            }
          />
        </div>
      </Dialog.Content>

      <Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <Dialog.Content maxWidth="400px">
          <div className="space-y-4">
            <Dialog.Title>Eliminar</Dialog.Title>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que quieres eliminar esta transacción? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button color="red" onClick={handleDeleteTransaction}>
                Eliminar transacción
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Dialog.Root>
  );
}
