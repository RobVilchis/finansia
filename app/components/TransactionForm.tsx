"use client";

import {
    Button,
    SegmentedControl,
    Select,
    TextField,
    Text,
    Box,
    Flex,
} from "@radix-ui/themes";
import { Controller, UseFormReturn } from "react-hook-form";
import {
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Tag,
    Wallet,
    CreditCard,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { TransactionFormData } from "./TransactionDialog";

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

export default function TransactionForm({
    form,
    categories,
    accounts,
    onSubmit,
    onCancel,
    submitLabel = "Guardar Transacción",
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

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Type Selector */}
            <Box>
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
                                    <span className="hidden sm:inline opacity-80">Transferencia</span>
                                </Flex>
                            </SegmentedControl.Item>
                        </SegmentedControl.Root>
                    )}
                />
            </Box>

            {/* Description */}
            <div>
                {/* <Text
                    as="label"
                    size="2"
                    weight="medium"
                    className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                >
                    Descripción
                </Text> */}
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField.Root
                            size="3"
                            placeholder={`¿De qué trata est${transactionType === 'transfer' ? 'a' : 'e'} ${transactionType === "expense" ? "gasto" : transactionType === "income" ? "ingreso" : "transferencia"}?`}
                            {...field}
                            value={field.value || ""}
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

            {/* Amount Input */}
            <div>
                {/* <Text
                    as="label"
                    size="2"
                    weight="medium"
                    className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                >
                    Monto
                </Text> */}
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

            <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                    {/* <Text
                        as="label"
                        size="2"
                        weight="medium"
                        className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                    >
                        Fecha
                    </Text> */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <Calendar size={18} className="text-gray-400" />
                        </div>
                        <input
                            className="h-10 w-full pl-10 pr-3 rounded-(--radius-3) bg-white dark:bg-[#00000040] border-gray-200 dark:border-zinc-700 text-(--color-foreground) shadow-(--shadow-1) focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-[15px]"
                            type="date"
                            {...register("date")}
                        />
                    </div>
                    {errors.date && (
                        <Text color="red" size="1" className="mt-1 block">
                            {errors.date.message}
                        </Text>
                    )}
                </div>

                {/* Time */}
                <div>
                    {/* <Text
                        as="label"
                        size="2"
                        weight="medium"
                        className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                    >
                        Hora
                    </Text> */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <Clock size={18} className="text-gray-400" />
                        </div>
                        <input
                            className="h-10 w-full pl-10 pr-3 rounded-(--radius-3) bg-white dark:bg-[#00000040] border-gray-200 dark:border-zinc-700 text-(--color-foreground) shadow-(--shadow-1) focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-[15px]"
                            type="time"
                            {...register("time")}
                        />
                    </div>
                    {errors.time && (
                        <Text color="red" size="1" className="mt-1 block">
                            {errors.time.message}
                        </Text>
                    )}
                </div>
            </div>



            {/* Dynamic Fields (Category / Accounts) */}
            <div className="flex gap-3 justify-between">
                {/* Source Account (Expense & Transfer) */}
                {(transactionType === "expense" || transactionType === "transfer") && (
                    <div className="flex-1">
                        {/* <Text
                            as="label"
                            size="2"
                            weight="medium"
                            className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                        >
                            Cuenta Origen
                        </Text> */}
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
                                                {accounts.find((a) => a.id === field.value)?.name ||
                                                    "Seleccionar cuenta"}
                                            </span>
                                        </Flex>
                                    </Select.Trigger>
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
                            <Text color="red" size="1" className="mt-1 block">
                                {errors.sourceAccountId.message}
                            </Text>
                        )}
                    </div>
                )}

                {/* Target Account (Income & Transfer) */}
                {(transactionType === "income" || transactionType === "transfer") && (
                    <div className="flex-1">
                        {/* <Text
                            as="label"
                            size="2"
                            weight="medium"
                            className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                        >
                            Cuenta Destino
                        </Text> */}
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
                                                {accounts.find((a) => a.id === field.value)?.name ||
                                                    "Seleccionar cuenta"}
                                            </span>
                                        </Flex>
                                    </Select.Trigger>
                                    <Select.Content>
                                        {accounts
                                            .filter(
                                                (account) =>
                                                    transactionType !== "transfer" ||
                                                    account.id !== watch("sourceAccountId"),
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
                            <Text color="red" size="1" className="mt-1 block">
                                {errors.targetAccountId.message}
                            </Text>
                        )}
                    </div>
                )}

                {/* Category (Non-transfer) */}
                {transactionType !== "transfer" && (
                    <div className="flex-1">
                        {/* <Text
                            as="label"
                            size="2"
                            weight="medium"
                            className="text-gray-600 dark:text-gray-400 mb-1.5 block"
                        >
                            Categoría
                        </Text> */}
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
                                                {field.value || "Elegir categoría"}
                                            </span>
                                        </Flex>
                                    </Select.Trigger>
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
                            <Text color="red" size="1" className="mt-1 block">
                                {errors.category.message}
                            </Text>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex gap-2">{extraActions}</div>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        size="3"
                        onClick={onCancel}
                        className="cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        size="3"
                        disabled={isSubmitting}
                        className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md cursor-pointer transition-all hover:shadow-lg"
                    >
                        {isSubmitting ? "Guardando..." : submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
