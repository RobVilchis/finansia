"use client";

import { Account } from "@/app/(main)/data/DataDashboard";

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

export default function AccountCard({ account, onEdit }: AccountCardProps) {
  const balanceColor =
    account.balance >= 0 ? "text-emerald-400" : "text-rose-400";

  return (
    <div
      onClick={() => onEdit(account)}
      className="p-5 cursor-pointer bg-white/6 backdrop-blur-md border border-white/10
        rounded-xl hover:bg-white/10 hover:border-white/20 transition-all
        w-40 flex flex-col justify-center items-start gap-2"
    >
      <h3 className="text-sm font-medium text-white/70 line-clamp-2">
        {account.name}
      </h3>
      <span className={`text-xl font-semibold font-mono tabular-nums ${balanceColor}`}>
        {account.balance < 0 ? "-" : ""}${Math.abs(account.balance).toFixed(2)}
      </span>
    </div>
  );
}
