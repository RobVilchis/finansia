"use client";

import { Transaction } from "../data/DataDashboard";

export default function TransactionCard({
  description,
  amount,
  showCategory = true,
  categoryName,
  type,
}: Omit<Transaction, "id" | "sourceAccountId"> & { showCategory?: boolean }) {
  let amountColor = "";
  if (type === "income") amountColor = "text-emerald-400";
  else if (type === "expense") amountColor = "text-rose-400";
  else amountColor = "text-cyan-400";

  return (
    <div
      className="w-full flex justify-between items-center gap-3 py-3 px-4
        bg-white/6 backdrop-blur-md rounded-xl border border-white/8
        cursor-pointer hover:bg-white/10 hover:border-white/16
        transition-all duration-200 shadow-lg shadow-black/10"
    >
      <div className="flex flex-col sm:flex-row w-full sm:items-center justify-between items-start gap-1 min-w-0">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white/90 line-clamp-1">
            {description}
          </h3>
        </div>
        {type !== "transfer" && showCategory && categoryName && (
          <span className="text-xs text-white/30 shrink-0">{categoryName}</span>
        )}
      </div>
      <span className={`text-base font-semibold shrink-0 font-mono tabular-nums ${amountColor}`}>
        {type === "expense" ? "-" : ""}${Number(amount).toFixed(2)}
      </span>
    </div>
  );
}
