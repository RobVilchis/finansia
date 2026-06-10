"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import AccountCard from "./AccountCard";
import AccountDialog from "./AccountDialog";
import { Account } from "@/app/(main)/data/DataDashboard";
import { useToast } from "./GenericToast";
import { EmptyState, ErrorState } from "./ui/states";

interface AccountsListProps {
  onAccountAdded: () => void;
}

export default function AccountsList({ onAccountAdded }: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { showToast } = useToast();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError("Ocurrió un error al cargar tus cuentas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFailure = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) => {
    showToast({ title, message, variant: "error" });
    setEditingAccount(null);
  };

  const handleUpdateSuccess = () => {
    //onAccountUpdated();
    showToast({
      title: "Cuenta actualizada con éxito",
      message: "",
      variant: "info",
    });
    setEditingAccount(null);
  };

  const handleDeleteSuccess = () => {
    //onAccountUpdated();
    showToast({
      title: "Cuenta eliminada con éxito",
      message: "",
      variant: "info",
    });
    setEditingAccount(null);
  };

  useEffect(() => {
    fetchAccounts();
  }, [onAccountAdded]);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-40 h-24 bg-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        compact
        message="No se pudieron cargar tus cuentas."
        onRetry={fetchAccounts}
      />
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        compact
        icon={<Wallet size={18} />}
        title="Sin cuentas registradas"
        description="Crea una cuenta para llevar el control de tus saldos."
        action={
          <Link
            href="/data?tab=accounts"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-surface border border-edge text-ink-muted hover:bg-surface-strong hover:text-ink hover:border-edge-strong"
          >
            Ir a cuentas
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={setEditingAccount}
          />
        ))}
      </div>
      {editingAccount && (
        <AccountDialog
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          account={editingAccount}
          onDeleteSuccess={handleDeleteSuccess}
          onFailed={handleUpdateFailure}
          onAccountUpdated={handleUpdateSuccess} // TODO: Refetch accounts
        />
      )}
    </div>
  );
}
