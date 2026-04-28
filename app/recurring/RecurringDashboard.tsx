"use client";

import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Plus, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRecurringTransactionAction,
  toggleRecurringTransactionAction,
} from "../actions/recurringTransactions";
import { useToast } from "../components/GenericToast";
import RecurringTransactionCard from "../components/RecurringTransactionCard";
import RecurringTransactionDialog from "../components/RecurringTransactionDialog";
import {
  GlassButton,
  GlassDialogShell,
  glassDialogContent,
} from "../components/ui/glass";

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
    <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-accent-soft border border-accent-border flex items-center justify-center text-accent-fg shrink-0">
              <Repeat size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-ink leading-tight truncate">
                Transacciones recurrentes
              </h1>
              <p className="text-sm text-ink-subtle">
                Gestiona tus pagos y cobros automáticos
              </p>
            </div>
          </div>
          <GlassButton
            variant="primary"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            Nueva
          </GlassButton>
        </div>

        {recurringTransactions.length === 0 && (
          <div className="text-center py-16 px-6 border border-dashed border-edge rounded-2xl bg-surface/50 backdrop-blur-md">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface border border-edge flex items-center justify-center text-ink-faint mb-4">
              <Repeat size={22} />
            </div>
            <h3 className="text-base font-medium text-ink-muted mb-1">
              No hay transacciones recurrentes
            </h3>
            <p className="text-sm text-ink-faint mb-6">
              Crea tu primera transacción recurrente para automatizar tus pagos
              e ingresos.
            </p>
            <GlassButton
              variant="primary"
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Crear transacción recurrente
            </GlassButton>
          </div>
        )}

        {recurringTransactions.length > 0 && (
          <div className="space-y-2">
            {recurringTransactions.map((rt) => (
              <div key={rt.id} onClick={() => setEditingTransaction(rt)}>
                <RecurringTransactionCard {...rt} onToggle={handleToggle} />
              </div>
            ))}
          </div>
        )}
      </div>

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

      <Dialog.Root
        open={!!showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setShowDeleteConfirm(null);
        }}
      >
        <Dialog.Content maxWidth="420px" className={glassDialogContent}>
          <VisuallyHidden>
            <Dialog.Title>Eliminar transacción recurrente</Dialog.Title>
          </VisuallyHidden>
          <GlassDialogShell
            icon={<Trash2 size={16} />}
            title="Eliminar transacción recurrente"
            subtitle="Esta acción no se puede deshacer"
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink-muted">
                ¿Estás seguro? Las transacciones ya creadas no serán eliminadas.
              </p>
              <div className="flex justify-end gap-2 pt-4 border-t border-edge-soft mt-2">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancelar
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="danger"
                  onClick={() =>
                    showDeleteConfirm && handleDelete(showDeleteConfirm)
                  }
                >
                  Eliminar
                </GlassButton>
              </div>
            </div>
          </GlassDialogShell>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
