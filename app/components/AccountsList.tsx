"use client";

import { useState, useEffect } from "react";
import AccountCard from "./AccountCard";
import AccountDialog from "./AccountDialog";

interface Account {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  balance: number;
}

interface AccountsListProps {
  onAccountAdded: () => void;
}

export default function AccountsList({ onAccountAdded }: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch accounts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/accounts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete account");
      await fetchAccounts();
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  useEffect(() => {
    console.log("running this");
    fetchAccounts();
  }, [onAccountAdded]);

  if (loading) {
    return <div>Loading accounts...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
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
          onDelete={handleDelete}
          onAccountUpdated={fetchAccounts}
        />
      )}
    </div>
  );
}
