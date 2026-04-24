"use client";

import { useEffect, useState } from "react";
import AccountCard from "./AccountCard";
import AccountDialog from "./AccountDialog";
import { Account } from "@/app/(main)/data/DataDashboard";
import { useToast } from "./GenericToast";

interface AccountsListProps {
  accounts: Account[];
  onAccountUpdated: () => void;
}

export default function AccountsList({
  accounts,
  onAccountUpdated,
}: AccountsListProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // TODO: Refetch accounts
  }, [onAccountUpdated]);

  const handleUpdateFailure = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) => {
    showToast({ title, message, variant: "error" });
  };

  const handleUpdateSuccess = () => {
    onAccountUpdated();
    showToast({
      title: "Cuenta actualizada con éxito",
      message: "",
      variant: "info",
    });
  };

  const handleDeleteSuccess = () => {
    onAccountUpdated();
    showToast({
      title: "Cuenta eliminada con éxito",
      message: "",
      variant: "info",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
