"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Transaction {
  id: string;
  description: string | null;
  amount: string;
  date: string;
  type: string;
  categoryName: string | null;
  sourceAccountName: string | null;
  targetAccountName: string | null;
}

export default function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-white/30 py-4 text-center">
        Aún no hay transacciones registradas.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const amountColor =
          tx.type === "income"
            ? "text-emerald-400"
            : tx.type === "expense"
              ? "text-rose-400"
              : "text-cyan-400";

        const subtitle =
          tx.type === "transfer"
            ? `${tx.sourceAccountName ?? ""} → ${tx.targetAccountName ?? ""}`
            : tx.categoryName ?? "";

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg
              bg-white/6 border border-white/8 hover:bg-white/10 hover:border-white/16 transition-all"
          >
            <div className="min-w-0">
              <p className="text-sm text-white/80 truncate">{tx.description ?? "Sin descripción"}</p>
              {subtitle && (
                <p className="text-xs text-white/30 truncate">{subtitle}</p>
              )}
            </div>
            <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ml-3 ${amountColor}`}>
              {tx.type === "expense" ? "-" : ""}${Number(tx.amount).toFixed(2)}
            </span>
          </div>
        );
      })}

      <Link
        href="/data"
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors pt-1"
      >
        Ver todas <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
