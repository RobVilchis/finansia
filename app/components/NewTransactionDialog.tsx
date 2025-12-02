"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  SegmentedControl,
  Select,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";
// If you are using date-fns v3.x or v4.x, please import `AdapterDateFns`

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

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: {
    concept: string;
    date: string;
    amount: number;
    category: string;
    accountId: string;
    type: string;
    targetAccountId?: string;
  }) => void;
}

const transactionSchema = z
  .object({
    concept: z.string().min(1, "La descripción es requerida"),
    date: z.string().min(10, "La fecha es requerida"),
    time: z.string().min(4, "La hora es requerida"),
    amount: z.string().min(1, "El monto es requerido"),
    category: z.string().optional(),
    type: z.enum(["expense", "income", "transfer"]),
    accountId: z.string().min(1, "La cuenta es requerida"),
    targetAccountId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "transfer") {
        return !!data.targetAccountId;
      }
      return true;
    },
    {
      message: "La cuenta destino es requerida para transferencias",
      path: ["targetAccountId"],
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

type TransactionFormData = z.infer<typeof transactionSchema>;

export type FieldProps<T extends keyof TransactionFormData> = {
  field: ControllerRenderProps<TransactionFormData, T>;
};

export default function NewTransactionDialog({
  open,
  onOpenChange,
  onAddExpense: onAddTransaction,
}: NewTransactionDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const currentDate = new Date();
  const dateString = currentDate.toISOString().split("T")[0];
  const timeString = currentDate.toTimeString().slice(0, 5);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    register,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      concept: "",
      date: dateString,
      time: timeString,
      amount: "",
      category: "",
      type: "expense",
      accountId: "",
      targetAccountId: "",
    },
  });

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

  const onSubmit = (data: TransactionFormData) => {
    onAddTransaction({
      concept: data.concept,
      date: `${data.date}T${data.time}`,
      amount: Number(data.amount),
      category: data.category || "",
      accountId: data.accountId,
      type: data.type,
      targetAccountId: data.targetAccountId,
    });
    reset();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="400px"
        style={{ overflow: "visible" }}
        className="z-40"
      >
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Agregar nueva transacción</Dialog.Title>
        </div>
        <div className=" relative overflow-visible z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                name="concept"
                control={control}
                render={({ field }: FieldProps<"concept">) => (
                  <TextField.Root
                    size={size}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.concept && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.concept.message}
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

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                {transactionType === "expense"
                  ? "Cuenta origen"
                  : transactionType === "income"
                  ? "Cuenta destino"
                  : "Cuenta origen"}
              </label>
              <Controller
                name="accountId"
                control={control}
                render={({ field }: FieldProps<"accountId">) => (
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
              {errors.accountId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountId.message}
                </p>
              )}
            </div>

            {transactionType === "transfer" && (
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
                            (account) => account.id !== watch("accountId")
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
                          .filter(
                            (category) => category.type === transactionType
                          )
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

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" color="blue">
                Agregar transacción
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
