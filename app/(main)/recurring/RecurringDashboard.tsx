"use client";

import { Button, Dialog } from "@radix-ui/themes";
import { Plus, Repeat } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRecurringTransactionAction,
  toggleRecurringTransactionAction,
} from "@/app/actions/recurringTransactions";
import { useToast } from "@/app/components/GenericToast";
import RecurringTransactionCard from "@/app/components/RecurringTransactionCard";
import RecurringTransactionDialog from "@/app/components/RecurringTransactionDialog";
import { GlassButton } from "@/app/components/ui/glass";
import { EmptyState } from "@/app/components/ui/states";

interface RecurringTransactionRow {
  id: string;
  description: string;
  amount: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  categoryName: string | null;
  categoryId: string | null;
  sourceAccountId: string | null;
  targetAccountId: string | null;
  sourceAccountName: string | null;
  targetAccountName: string | null;
  createdAt: Date | null;
}

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

export default function RecurringDashboard({
  recurringTransactions,
  accounts,
  categories,
}: {
  recurringTransactions: RecurringTransactionRow[];
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransactionRow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const router = useRouter();
  const { showToast } = useToast();

  const handleToggle = async (id: string, currentActive: boolean) => {
    const result = await toggleRecurringTransactionAction(id, !currentActive);
    if (result.success) {
      showToast({
        title: result.message,
        message: "",
        variant: "info",
      });
      router.refresh();
    } else {
      showToast({
        title: "Error",
        message: result.message,
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRecurringTransactionAction(id);
    setShowDeleteConfirm(null);
    setEditingTransaction(null);
    if (result.success) {
      showToast({
        title: result.message,
        message: "",
        variant: "info",
      });
      router.refresh();
    } else {
      showToast({
        title: "Error",
        message: result.message,
        variant: "error",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Repeat
              size={24}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transacciones recurrentes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tus pagos y cobros automáticos
            </p>
          </div>
        </div>
        <Button
          size="3"
          onClick={() => setShowCreateDialog(true)}
          className="bg-linear-to-r from-indigo-600 to-blue-600 text-white cursor-pointer"
        >
          <Plus size={18} />
          Nueva
        </Button>
      </div>

      {/* Empty State */}
      {recurringTransactions.length === 0 && (
        <EmptyState
          icon={<Repeat size={24} />}
          title="No hay transacciones recurrentes"
          description="Crea tu primera transacción recurrente para automatizar tus pagos e ingresos."
          action={
            <GlassButton
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Crear transacción recurrente
            </GlassButton>
          }
        />
      )}

      {/* List */}
      {recurringTransactions.length > 0 && (
        <div className="space-y-2">
          {recurringTransactions.map((rt) => (
            <div key={rt.id} onClick={() => setEditingTransaction(rt)}>
              <RecurringTransactionCard {...rt} onToggle={handleToggle} />
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <RecurringTransactionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        accounts={accounts}
        categories={categories}
        onSuccess={() => {
          setShowCreateDialog(false);
          router.refresh();
        }}
      />

      {/* Edit Dialog */}
      {editingTransaction && (
        <RecurringTransactionDialog
          open={!!editingTransaction}
          onOpenChange={(open) => {
            if (!open) setEditingTransaction(null);
          }}
          accounts={accounts}
          categories={categories}
          editingTransaction={editingTransaction}
          onSuccess={() => {
            setEditingTransaction(null);
            router.refresh();
          }}
          deleteRecurringTransaction={setShowDeleteConfirm}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog.Root
        open={!!showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setShowDeleteConfirm(null);
        }}
      >
        <Dialog.Content maxWidth="400px">
          <div className="space-y-4">
            <Dialog.Title>Eliminar transacción recurrente</Dialog.Title>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro? Esta acción no se puede deshacer. Las transacciones
              ya creadas no serán eliminadas.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                onClick={() =>
                  showDeleteConfirm && handleDelete(showDeleteConfirm)
                }
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
