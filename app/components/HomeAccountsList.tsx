"use client";

import { useEffect, useState } from "react";
import AccountCard from "./AccountCard";
import AccountDialog from "./AccountDialog";
import { Account } from "@/app/(main)/data/DataDashboard";
import { useToast } from "./GenericToast";

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

  useEffect(() => {
    fetchAccounts();
  }, []);

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
    return <div className="text-red-500">{error}</div>;
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
