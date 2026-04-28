"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import {
    Calendar,
    Clock,
    DollarSign,
    FileText,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { TransactionFormData } from "./TransactionDialog";
import {
    GlassInput,
    GlassSelect,
    GlassButton,
    GlassSegmented,
    FieldError,
} from "./ui/glass";

export interface Category {
    name: string;
    type: string;
}

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
}

interface TransactionFormProps {
    form: UseFormReturn<TransactionFormData>;
    categories: Category[];
    accounts: Account[];
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    extraActions?: React.ReactNode;
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

export default function TransactionForm({
    form,
    categories,
    accounts,
    onSubmit,
    onCancel,
    submitLabel = "Guardar",
    isSubmitting = false,
    extraActions,
}: TransactionFormProps) {
    const {
        control,
        watch,
        register,
        formState: { errors },
    } = form;

    const transactionType = watch("type");
    const sourceAccountId = watch("sourceAccountId");

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <GlassSegmented
                        value={field.value as "expense" | "income" | "transfer"}
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
                            placeholder={`¿De qué trata est${transactionType === "transfer" ? "a" : "e"} ${transactionType === "expense" ? "gasto" : transactionType === "income" ? "ingreso" : "transferencia"}?`}
                            {...field}
                            value={field.value ?? ""}
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
                            placeholder="Monto"
                            type="number"
                            step="0.01"
                            className="font-mono tabular-nums"
                            {...field}
                        />
                    )}
                />
                <FieldError message={errors.amount?.message} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <GlassInput
                        leadingIcon={<Calendar size={16} />}
                        type="date"
                        {...register("date")}
                    />
                    <FieldError message={errors.date?.message} />
                </div>
                <div>
                    <GlassInput
                        leadingIcon={<Clock size={16} />}
                        type="time"
                        {...register("time")}
                    />
                    <FieldError message={errors.time?.message} />
                </div>
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
                                            {a.name} (${a.balance})
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
                                                a.id !== sourceAccountId,
                                        )
                                        .map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} (${a.balance})
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
                                            <option key={c.name} value={c.name}>
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
                <div>{extraActions}</div>
                <div className="flex gap-2">
                    <GlassButton type="button" variant="secondary" onClick={onCancel}>
                        Cancelar
                    </GlassButton>
                    <GlassButton type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : submitLabel}
                    </GlassButton>
                </div>
            </div>
        </form>
    );
}
