"use client";

import {
  Button,
  Dialog,
  SegmentedControl,
  Select,
  TextField,
} from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { Transaction } from "../data/DataDashboard";
import {
  deleteTransactionAction,
  updateTransactionAction,
} from "../actions/transactions";
import { useToast } from "./GenericToast";

interface Category {
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

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
      path: ["accountId"],
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
      path: ["accountId"],
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

type FieldProps<T extends keyof TransactionFormData> = {
  field: ControllerRenderProps<TransactionFormData, T>;
};

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

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    register,
    reset,
  } = useForm<TransactionFormData>({
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

  const transactionType = watch("type");

  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

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

  const action: () => void = handleSubmit(async (formData) => {
    const result = await updateTransactionAction(transaction.id, {
      ...formData,
      date: `${formData.date}T${formData.time}`,
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

    // setServerResponse(response);
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
      <Dialog.Content maxWidth="400px">
        <div className="mb-2">
          <Dialog.Title>Editar transacción</Dialog.Title>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Tipo de transacción
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }: FieldProps<"type">) => (
                <SegmentedControl.Root
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SegmentedControl.Item value="expense">
                    Gasto
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="income">
                    Ingreso
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="transfer">
                    Transferencia
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Descripción
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }: FieldProps<"description">) => (
                <TextField.Root
                  size={size}
                  value={field.value ? field.value : ""}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Monto
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field }: FieldProps<"amount">) => (
                <TextField.Root
                  size={size}
                  type="number"
                  step="0.01"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="flex justify-start gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Fecha
              </label>

              <input
                className="h-10 px-2 w-full rounded-md bg-dark-50 border 
                  border-neutral-600 focus:outline-2 focus:outline-blue-600"
                type="date"
                id="date"
                {...register("date")}
              />

              {errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Hora
              </label>

              <input
                className="h-10 px-2 w-full rounded-md bg-dark-50 border 
                  border-neutral-600 focus:outline-2 focus:outline-blue-600"
                type="time"
                id="time"
                {...register("time")}
              />

              {errors.time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          {transactionType === "expense" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Cuenta origen
              </label>
              <Controller
                name="sourceAccountId"
                control={control}
                render={({ field }: FieldProps<"sourceAccountId">) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                    size={size}
                  >
                    <Select.Trigger placeholder="Elige una" />
                    <Select.Content>
                      {accounts.map((account, i) => (
                        <Select.Item key={i} value={account.id}>
                          {account.name} (${account.balance})
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.sourceAccountId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.sourceAccountId.message}
                </p>
              )}
            </div>
          )}

          {transactionType === "income" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Cuenta destino
              </label>
              <Controller
                name="targetAccountId"
                control={control}
                render={({ field }: FieldProps<"targetAccountId">) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                    size={size}
                  >
                    <Select.Trigger placeholder="Elige una" />
                    <Select.Content>
                      {accounts.map((account, i) => (
                        <Select.Item key={i} value={account.id}>
                          {account.name} (${account.balance})
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.targetAccountId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.targetAccountId.message}
                </p>
              )}
            </div>
          )}

          {transactionType === "transfer" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Cuenta origen
                </label>
                <Controller
                  name="sourceAccountId"
                  control={control}
                  render={({ field }: FieldProps<"sourceAccountId">) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                      size={size}
                    >
                      <Select.Trigger placeholder="Elige una" />
                      <Select.Content>
                        {accounts.map((account, i) => (
                          <Select.Item key={i} value={account.id}>
                            {account.name} (${account.balance})
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.sourceAccountId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sourceAccountId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Cuenta destino
                </label>
                <Controller
                  name="targetAccountId"
                  control={control}
                  render={({ field }: FieldProps<"targetAccountId">) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                      size={size}
                    >
                      <Select.Trigger placeholder="Elige una" />
                      <Select.Content>
                        {accounts
                          .filter(
                            (account) => account.id !== watch("sourceAccountId")
                          )
                          .map((account, i) => (
                            <Select.Item key={i} value={account.id}>
                              {account.name} (${account.balance})
                            </Select.Item>
                          ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.targetAccountId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.targetAccountId.message}
                  </p>
                )}
              </div>
            </>
          )}

          {transactionType !== "transfer" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Categoría
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }: FieldProps<"category">) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                    size={size}
                  >
                    <Select.Trigger placeholder="Elige una" />
                    <Select.Content>
                      {categories
                        .filter((category) => category.type === transactionType)
                        .map((category, i) => (
                          <Select.Item key={i} value={category.name}>
                            {category.name}
                          </Select.Item>
                        ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="ghost"
              color="gray"
              onClick={() => setShowDeleteConfirm(true)}
              title="Eliminar transacción"
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
