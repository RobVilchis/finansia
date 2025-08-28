"use client";

import { useEffect, useState } from "react";
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
    fetchAccounts();
  }, [onAccountAdded]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-3">
                <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                <div className="w-20 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
          onDelete={handleDelete}
          onAccountUpdated={fetchAccounts}
        />
      )}
    </div>
  );
}
