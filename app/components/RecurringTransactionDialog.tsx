"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  Flex,
  SegmentedControl,
  Select,
  Text,
  TextField,
  VisuallyHidden,
} from "@radix-ui/themes";
import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Repeat,
  Tag,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Wallet,
  Trash2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  createRecurringTransactionAction,
  updateRecurringTransactionAction,
} from "../actions/recurringTransactions";
import { useToast } from "./GenericToast";
import { FREQUENCY_LABELS, type Frequency } from "@/lib/db/schema/recurringTransactions";

const FREQUENCIES = Object.entries(FREQUENCY_LABELS) as [Frequency, string][];

const recurringSchema = z
  .object({
    description: z.string().min(1, "La descripción es requerida"),
    amount: z.string().min(1, "El monto es requerido"),
    type: z.enum(["expense", "income", "transfer"]),
    category: z.string().optional(),
    sourceAccountId: z.string().optional(),
    targetAccountId: z.string().optional(),
    frequency: z.string().min(1, "La frecuencia es requerida"),
    startDate: z.string().min(10, "La fecha de inicio es requerida"),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "expense") return !!data.sourceAccountId;
      return true;
    },
    {
      message: "La cuenta origen es requerida para gastos",
      path: ["sourceAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "income") return !!data.targetAccountId;
      return true;
    },
    {
      message: "La cuenta destino es requerida para ingresos",
      path: ["targetAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "transfer")
        return !!data.sourceAccountId && !!data.targetAccountId;
      return true;
    },
    {
      message: "Ambas cuentas son requeridas para transferencias",
      path: ["sourceAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type !== "transfer") return !!data.category;
      return true;
    },
    {
      message: "La categoría es requerida",
      path: ["category"],
    }
  );

type RecurringFormData = z.infer<typeof recurringSchema>;

interface AccountOption {
  id: string;
  name: string;
  type: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

interface EditingTransaction {
  id: string;
  description: string;
  amount: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  categoryName: string | null;
  sourceAccountId: string | null;
  targetAccountId: string | null;
}

interface RecurringTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: AccountOption[];
  categories: CategoryOption[];
  editingTransaction?: EditingTransaction | null;
  onSuccess: () => void;
  deleteRecurringTransaction?: (id: string) => void;
}

export default function RecurringTransactionDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  editingTransaction,
  onSuccess,
  deleteRecurringTransaction,
}: RecurringTransactionDialogProps) {
  const { showToast } = useToast();
  const isEditing = !!editingTransaction;

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      description: editingTransaction?.description ?? "",
      amount: editingTransaction?.amount ?? "",
      type: (editingTransaction?.type as "expense" | "income" | "transfer") ?? "expense",
      category: editingTransaction?.categoryName ?? "",
      sourceAccountId: editingTransaction?.sourceAccountId ?? "",
      targetAccountId: editingTransaction?.targetAccountId ?? "",
      frequency: editingTransaction?.frequency ?? "monthly",
      startDate: editingTransaction?.startDate ?? today,
      endDate: editingTransaction?.endDate ?? "",
    },
  });

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const transactionType = watch("type");

  const action = handleSubmit(async (data) => {
    if (isEditing) {
      const result = await updateRecurringTransactionAction(
        editingTransaction.id,
        {
          description: data.description,
          amount: data.amount,
          type: data.type,
          categoryName: data.type !== "transfer" ? data.category : undefined,
          sourceAccountId: data.sourceAccountId || undefined,
          targetAccountId: data.targetAccountId || undefined,
          frequency: data.frequency as Frequency,
          startDate: data.startDate,
          endDate: data.endDate || null,
        }
      );

      if (result.success) {
        showToast({
          title: "Transacción recurrente actualizada",
          message: "",
          variant: "info",
        });
        onSuccess();
      } else {
        showToast({
          title: "Error",
          message: result.message,
          variant: "error",
        });
      }
    } else {
      const result = await createRecurringTransactionAction({
        description: data.description,
        amount: data.amount,
        type: data.type,
        categoryName: data.type !== "transfer" ? data.category : undefined,
        sourceAccountId: data.sourceAccountId || undefined,
        targetAccountId: data.targetAccountId || undefined,
        frequency: data.frequency as Frequency,
        startDate: data.startDate,
        endDate: data.endDate || null,
      });

      if (result.success) {
        showToast({
          title: "Transacción recurrente creada",
          message: "",
          variant: "info",
        });
        reset();
        onSuccess();
      } else {
        showToast({
          title: "Error",
          message: result.message,
          variant: "error",
        });
      }
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{ maxWidth: 500, overflow: "visible" }}
        className="z-40 p-0! rounded-2xl! bg-white! dark:bg-zinc-900! shadow-xl"
      >
        <VisuallyHidden>
          <Dialog.Title>
            {isEditing ? "Editar" : "Nueva"} transacción recurrente
          </Dialog.Title>
        </VisuallyHidden>

        {/* Header */}
        <div className="bg-linear-to-r bg-slate-600 px-6 py-4 rounded-t-2xl text-white">
          <Flex align="center" gap="3" className="mb-2">
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
              <Repeat size={16} className="text-white" />
            </div>
            <div className="text-xl font-bold m-0 text-white">
              {isEditing ? "Editar" : "Nueva"} transacción recurrente
            </div>
          </Flex>
          <Text size="2" className="text-blue-100 opacity-90">
            {isEditing
              ? "Modifica los detalles de esta transacción recurrente."
              : "Configura un pago o ingreso que se repite automáticamente."}
          </Text>
        </div>

        <form onSubmit={action} className="p-6 flex flex-col gap-5">
          {/* Type Selector */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SegmentedControl.Root
                value={field.value}
                onValueChange={field.onChange}
                size="3"
                className="w-full bg-gray-100! dark:bg-zinc-800! p-1 rounded-xl"
              >
                <SegmentedControl.Item
                  value="expense"
                  className="data-[state=active]:bg-white! dark:data-[state=active]:bg-zinc-700! data-[state=active]:shadow-sm!"
                >
                  <Flex align="center" gap="2">
                    <TrendingDown size={16} className="text-red-500" />
                    <span className="hidden sm:inline opacity-80">Gasto</span>
                  </Flex>
                </SegmentedControl.Item>
                <SegmentedControl.Item
                  value="income"
                  className="data-[state=active]:bg-white! dark:data-[state=active]:bg-zinc-700! data-[state=active]:shadow-sm!"
                >
                  <Flex align="center" gap="2">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="hidden sm:inline opacity-80">Ingreso</span>
                  </Flex>
                </SegmentedControl.Item>
                <SegmentedControl.Item
                  value="transfer"
                  className="data-[state=active]:bg-white! dark:data-[state=active]:bg-zinc-700! data-[state=active]:shadow-sm!"
                >
                  <Flex align="center" gap="2">
                    <ArrowRightLeft size={16} className="text-blue-500" />
                    <span className="hidden sm:inline opacity-80">
                      Transferencia
                    </span>
                  </Flex>
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            )}
          />

          {/* Description */}
          <div>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField.Root
                  size="3"
                  placeholder="Descripción (ej. Netflix, Nómina)"
                  {...field}
                >
                  <TextField.Slot>
                    <FileText size={18} className="text-gray-400" />
                  </TextField.Slot>
                </TextField.Root>
              )}
            />
            {errors.description && (
              <Text color="red" size="1" className="mt-1 block">
                {errors.description.message}
              </Text>
            )}
          </div>

          {/* Amount */}
          <div>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField.Root
                  size="3"
                  placeholder="Monto"
                  type="number"
                  step="0.01"
                  className="font-medium!"
                  {...field}
                >
                  <TextField.Slot>
                    <DollarSign size={18} className="text-gray-400" />
                  </TextField.Slot>
                </TextField.Root>
              )}
            />
            {errors.amount && (
              <Text color="red" size="1" className="mt-1 block">
                {errors.amount.message}
              </Text>
            )}
          </div>

          {/* Frequency & Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                    size="3"
                  >
                    <Select.Trigger
                      placeholder="Frecuencia"
                      className="w-full!"
                      variant="surface"
                    >
                      <Flex as="span" align="center" gap="2">
                        <Repeat size={16} className="text-gray-400" />
                        <span>
                          {FREQUENCY_LABELS[field.value as Frequency] ?? "Frecuencia"}
                        </span>
                      </Flex>
                    </Select.Trigger>
                    <Select.Content>
                      {FREQUENCIES.map(([value, label]) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.frequency && (
                <Text color="red" size="1" className="mt-1 block">
                  {errors.frequency.message}
                </Text>
              )}
            </div>

            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  className="h-10 w-full pl-10 pr-3 rounded-(--radius-3) bg-white dark:bg-[#00000040] border-gray-200 dark:border-zinc-700 text-(--color-foreground) shadow-(--shadow-1) focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-[15px]"
                  type="date"
                  {...register("startDate")}
                />
              </div>
              {errors.startDate && (
                <Text color="red" size="1" className="mt-1 block">
                  {errors.startDate.message}
                </Text>
              )}
            </div>
          </div>

          {/* End Date (optional) */}
          <div>
            <Text
              size="2"
              weight="medium"
              className="text-gray-500 dark:text-gray-400 mb-1.5 block"
            >
              Fecha de fin (opcional)
            </Text>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                className="h-10 w-full pl-10 pr-3 rounded-(--radius-3) bg-white dark:bg-[#00000040] border-gray-200 dark:border-zinc-700 text-(--color-foreground) shadow-(--shadow-1) focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-[15px]"
                type="date"
                {...register("endDate")}
              />
            </div>
          </div>

          {/* Accounts & Category */}
          <div className="flex gap-3 justify-between">
            {(transactionType === "expense" ||
              transactionType === "transfer") && (
                <div className="flex-1">
                  <Controller
                    name="sourceAccountId"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        value={field.value}
                        onValueChange={field.onChange}
                        size="3"
                      >
                        <Select.Trigger
                          placeholder="Cuenta origen"
                          className="w-full!"
                          variant="surface"
                        >
                          <Flex as="span" align="center" gap="2" className="w-full">
                            {!field.value && (
                              <CreditCard size={16} className="text-gray-400" />
                            )}
                            <span className="truncate">
                              {accounts.find((a) => a.id === field.value)?.name ??
                                "Cuenta origen"}
                            </span>
                          </Flex>
                        </Select.Trigger>
                        <Select.Content>
                          {accounts.map((account) => (
                            <Select.Item key={account.id} value={account.id}>
                              {account.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                  {errors.sourceAccountId && (
                    <Text color="red" size="1" className="mt-1 block">
                      {errors.sourceAccountId.message}
                    </Text>
                  )}
                </div>
              )}

            {(transactionType === "income" ||
              transactionType === "transfer") && (
                <div className="flex-1">
                  <Controller
                    name="targetAccountId"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        value={field.value}
                        onValueChange={field.onChange}
                        size="3"
                      >
                        <Select.Trigger
                          placeholder="Cuenta destino"
                          className="w-full!"
                          variant="surface"
                        >
                          <Flex as="span" align="center" gap="2" className="w-full">
                            {!field.value && (
                              <Wallet size={16} className="text-gray-400" />
                            )}
                            <span className="truncate">
                              {accounts.find((a) => a.id === field.value)?.name ??
                                "Cuenta destino"}
                            </span>
                          </Flex>
                        </Select.Trigger>
                        <Select.Content>
                          {accounts
                            .filter(
                              (account) =>
                                transactionType !== "transfer" ||
                                account.id !== watch("sourceAccountId")
                            )
                            .map((account) => (
                              <Select.Item key={account.id} value={account.id}>
                                {account.name}
                              </Select.Item>
                            ))}
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                  {errors.targetAccountId && (
                    <Text color="red" size="1" className="mt-1 block">
                      {errors.targetAccountId.message}
                    </Text>
                  )}
                </div>
              )}

            {transactionType !== "transfer" && (
              <div className="flex-1">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                      size="3"
                    >
                      <Select.Trigger
                        placeholder="Categoría"
                        className="w-full!"
                        variant="surface"
                      >
                        <Flex as="span" align="center" gap="2" className="w-full">
                          {!field.value && (
                            <Tag size={16} className="text-gray-400" />
                          )}
                          <span className="truncate">
                            {field.value || "Categoría"}
                          </span>
                        </Flex>
                      </Select.Trigger>
                      <Select.Content>
                        {categories
                          .filter((c) => c.type === transactionType)
                          .map((category) => (
                            <Select.Item
                              key={category.id}
                              value={category.name}
                            >
                              {category.name}
                            </Select.Item>
                          ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.category && (
                  <Text color="red" size="1" className="mt-1 block">
                    {errors.category.message}
                  </Text>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="soft"
              color="crimson"
              size="3"
              onClick={() => deleteRecurringTransaction && isEditing && deleteRecurringTransaction(editingTransaction.id)}
              className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={18} />
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="soft"
                color="gray"
                size="3"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="3"
                disabled={isSubmitting}
                className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md cursor-pointer transition-all hover:shadow-lg"
              >
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
