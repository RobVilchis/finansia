"use client";

import { Account } from "@/app/(main)/data/DataDashboard";

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
      className="p-6 cursor-pointer 
      bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-none  hover:shadow-md \
        dark:hover:bg-slate-700 transition-all
      w-40 h-30 flex flex-col justify-center items-start "
    >
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-100 line-clamp-2">
          {account.name}
        </h3>
        <span className={`text-xl font-semibold ${balanceColor}`}>
          {account.balance < 0 ? "-" : ""}$
          {Math.abs(account.balance).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
