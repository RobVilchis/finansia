"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import {
  Calendar,
  DollarSign,
  FileText,
  Repeat,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
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
import {
  GlassDialogShell,
  GlassInput,
  GlassSelect,
  GlassButton,
  GlassSegmented,
  FieldLabel,
  FieldError,
  glassDialogContent,
} from "./ui/glass";

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
  .refine((d) => (d.type === "expense" ? !!d.sourceAccountId : true), {
    message: "La cuenta origen es requerida para gastos",
    path: ["sourceAccountId"],
  })
  .refine((d) => (d.type === "income" ? !!d.targetAccountId : true), {
    message: "La cuenta destino es requerida para ingresos",
    path: ["targetAccountId"],
  })
  .refine(
    (d) => (d.type === "transfer" ? !!d.sourceAccountId && !!d.targetAccountId : true),
    {
      message: "Ambas cuentas son requeridas para transferencias",
      path: ["sourceAccountId"],
    }
  )
  .refine((d) => (d.type !== "transfer" ? !!d.category : true), {
    message: "La categoría es requerida",
    path: ["category"],
  });

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

const TYPE_OPTIONS = [
  {
    value: "expense" as const,
    label: "Gasto",
    icon: <TrendingDown size={14} />,
    accent: "text-rose-400",
  },
  {
    value: "income" as const,
    label: "Ingreso",
    icon: <TrendingUp size={14} />,
    accent: "text-emerald-400",
  },
  {
    value: "transfer" as const,
    label: "Transferencia",
    icon: <ArrowRightLeft size={14} />,
    accent: "text-cyan-400",
  },
];

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
  const sourceAccountId = watch("sourceAccountId");

  const action = handleSubmit(async (data) => {
    const payload = {
      description: data.description,
      amount: data.amount,
      type: data.type,
      categoryName: data.type !== "transfer" ? data.category : undefined,
      sourceAccountId: data.sourceAccountId || undefined,
      targetAccountId: data.targetAccountId || undefined,
      frequency: data.frequency as Frequency,
      startDate: data.startDate,
      endDate: data.endDate || null,
    };

    const result = isEditing
      ? await updateRecurringTransactionAction(editingTransaction.id, payload)
      : await createRecurringTransactionAction(payload);

    if (result.success) {
      showToast({
        title: isEditing
          ? "Transacción recurrente actualizada"
          : "Transacción recurrente creada",
        message: "",
        variant: "info",
      });
      if (!isEditing) reset();
      onSuccess();
    } else {
      showToast({
        title: "Error",
        message: result.message,
        variant: "error",
      });
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>
            {isEditing ? "Editar" : "Nueva"} transacción recurrente
          </Dialog.Title>
        </VisuallyHidden>
        <GlassDialogShell
          icon={<Repeat size={16} />}
          title={isEditing ? "Editar recurrente" : "Nueva recurrente"}
          subtitle={
            isEditing
              ? "Modifica los detalles del pago automático"
              : "Configura un pago o ingreso que se repite"
          }
        >
          <form onSubmit={action} className="flex flex-col gap-4">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <GlassSegmented
                  value={field.value}
                  onChange={field.onChange}
                  options={TYPE_OPTIONS}
                />
              )}
            />

            <div>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <GlassInput
                    leadingIcon={<FileText size={16} />}
                    placeholder="Descripción (ej. Netflix, Nómina)"
                    {...field}
                  />
                )}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <GlassInput
                    leadingIcon={<DollarSign size={16} />}
                    type="number"
                    step="0.01"
                    placeholder="Monto"
                    className="font-mono tabular-nums"
                    {...field}
                  />
                )}
              />
              <FieldError message={errors.amount?.message} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Frecuencia</FieldLabel>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <GlassSelect
                      leadingIcon={<Repeat size={16} />}
                      {...field}
                    >
                      {FREQUENCIES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </GlassSelect>
                  )}
                />
                <FieldError message={errors.frequency?.message} />
              </div>

              <div>
                <FieldLabel>Inicio</FieldLabel>
                <GlassInput
                  leadingIcon={<Calendar size={16} />}
                  type="date"
                  {...register("startDate")}
                />
                <FieldError message={errors.startDate?.message} />
              </div>
            </div>

            <div>
              <FieldLabel>Fecha de fin (opcional)</FieldLabel>
              <GlassInput
                leadingIcon={<Calendar size={16} />}
                type="date"
                {...register("endDate")}
              />
            </div>

            <div className="flex gap-3">
              {(transactionType === "expense" || transactionType === "transfer") && (
                <div className="flex-1">
                  <Controller
                    name="sourceAccountId"
                    control={control}
                    render={({ field }) => (
                      <GlassSelect {...field} value={field.value ?? ""}>
                        <option value="">Cuenta origen</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </GlassSelect>
                    )}
                  />
                  <FieldError message={errors.sourceAccountId?.message} />
                </div>
              )}

              {(transactionType === "income" || transactionType === "transfer") && (
                <div className="flex-1">
                  <Controller
                    name="targetAccountId"
                    control={control}
                    render={({ field }) => (
                      <GlassSelect {...field} value={field.value ?? ""}>
                        <option value="">Cuenta destino</option>
                        {accounts
                          .filter(
                            (a) =>
                              transactionType !== "transfer" ||
                              a.id !== sourceAccountId
                          )
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                      </GlassSelect>
                    )}
                  />
                  <FieldError message={errors.targetAccountId?.message} />
                </div>
              )}

              {transactionType !== "transfer" && (
                <div className="flex-1">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <GlassSelect {...field} value={field.value ?? ""}>
                        <option value="">Categoría</option>
                        {categories
                          .filter((c) => c.type === transactionType)
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </GlassSelect>
                    )}
                  />
                  <FieldError message={errors.category?.message} />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/8">
              <div>
                {isEditing && deleteRecurringTransaction && (
                  <GlassButton
                    type="button"
                    variant="danger"
                    onClick={() => deleteRecurringTransaction(editingTransaction.id)}
                    className="p-2!"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </GlassButton>
                )}
              </div>
              <div className="flex gap-2">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </GlassButton>
                <GlassButton type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Guardando..."
                    : isEditing
                      ? "Actualizar"
                      : "Crear"}
                </GlassButton>
              </div>
            </div>
          </form>
        </GlassDialogShell>
      </Dialog.Content>
    </Dialog.Root>
  );
}
