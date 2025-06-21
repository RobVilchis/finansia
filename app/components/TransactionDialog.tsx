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
  transaction: {
    id: string;
    concept: string;
    date: string;
    type: "income" | "expense" | "transfer" | undefined;
    amount: number;
    category: string;
    accountId?: string;
    targetAccountId?: string;
  };
  onUpdate: (transaction: {
    id: string;
    concept: string;
    date: string;
    type: string;
    amount: number;
    category: string;
    accountId: string;
    targetAccountId?: string;
  }) => void;
  onDelete: (id: string) => void;
}

const transactionSchema = z
  .object({
    concept: z.string().min(1, "Description is required"),
    date: z.string().min(10, "Date is required"),
    time: z.string().min(4, "Time is required"),
    amount: z.string().min(1, "Amount is required"),
    category: z.string().optional(),
    type: z.enum(["expense", "income", "transfer"]),
    accountId: z.string().min(1, "Account is required"),
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
      message: "Target account is required for transfers",
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
      message: "Category is required for expenses and income",
      path: ["category"],
    }
  );

type TransactionFormData = z.infer<typeof transactionSchema>;

type FieldProps<T extends keyof TransactionFormData> = {
  field: ControllerRenderProps<TransactionFormData, T>;
};

export default function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onUpdate,
  onDelete,
}: TransactionDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const transactionDate = new Date(transaction.date);
  const dateString = transactionDate.toISOString().split("T")[0];
  const timeString = transactionDate.toTimeString().slice(0, 5);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    register,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      concept: transaction.concept,
      date: dateString,
      time: timeString,
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      accountId: transaction.accountId || "",
      targetAccountId: transaction.targetAccountId || "",
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

  const onSubmit = async (data: TransactionFormData) => {
    onUpdate({
      id: transaction.id,
      concept: data.concept,
      date: `${data.date}T${data.time}`,
      type: data.type,
      amount: Number(data.amount),
      category: data.category || "",
      accountId: data.accountId,
      targetAccountId: data.targetAccountId,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Edit transaction</Dialog.Title>
          <Button
            variant="soft"
            color="red"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(transaction.id);
                }}
              >
                Delete Transaction
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Transaction Type
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
                      Expense
                    </SegmentedControl.Item>
                    <SegmentedControl.Item value="income">
                      Income
                    </SegmentedControl.Item>
                    <SegmentedControl.Item value="transfer">
                      Transfer
                    </SegmentedControl.Item>
                  </SegmentedControl.Root>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Description
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
                Amount
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
                  Date
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
                  Time
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
                  ? "Source account"
                  : transactionType === "income"
                  ? "Target account"
                  : "Source account"}
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
                    <Select.Trigger placeholder="Pick one" />
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
                  Target account
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
                      <Select.Trigger placeholder="Pick one" />
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
                  Category
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
                      <Select.Trigger placeholder="Pick one" />
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
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" color="blue">
                Update
              </Button>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
