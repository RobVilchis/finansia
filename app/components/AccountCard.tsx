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
      className="p-6 cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition-shadow 
      bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 
      w-40 h-36 flex flex-col justify-center items-start "
    >
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-100">
          {account.name}
        </h3>
        <span className={`text-xl font-semibold ${balanceColor}`}>
          ${Number(account.balance).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
