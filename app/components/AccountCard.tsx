"use client";

interface Account {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  balance: number;
}

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

export default function AccountCard({ account, onEdit }: AccountCardProps) {
  const balanceColor =
    account.balance >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div
      onClick={() => onEdit(account)}
      className="p-4 cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start w-full">
        <div className="space-y-2 w-full">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {account.name}
            </h3>
            <span className={`text-lg font-semibold ${balanceColor}`}>
              ${Number(account.balance).toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type: {account.type || "Not specified"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created: {new Date(account.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
