"use client";

import { Badge } from "@radix-ui/themes";
import { Transaction } from "@/app/(main)/data/DataDashboard";

export default function TransactionCard({
  description,
  date,
  amount,
  showCategory = true,
  categoryName,
  type,
}: Omit<Transaction, "id" | "sourceAccountId"> & { showCategory?: boolean }) {
  let amountColor = "";
  if (type === "income") amountColor = "text-green-600 dark:text-green-400";
  else if (type === "expense") amountColor = "text-red-600 dark:text-red-400";
  else amountColor = "text-blue-600 dark:text-blue-400";

  return (
    <>
      <div
        className="w-full sm:h-16  flex justify-between items-center  sm:gap-3  py-3 px-4   \
         bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-none cursor-pointer hover:shadow-md \
        dark:hover:bg-slate-700 transition-all"
      >
        <div className="flex flex-col sm:flex-row w-full sm:items-center justify-between items-start gap-1">
          <div>
            <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
              {description}
            </h3>
            <p className="hidden  text-sm text-slate-500 dark:text-slate-400">
              {new Date(date).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          {type != "transfer" && showCategory && (
            <Badge variant="soft" color="gray" size="1">
              {categoryName}
            </Badge>
          )}
        </div>
        <span className={`text-lg font-bold ${amountColor}`}>
          {type === "expense" ? "-" : ""}${Number(amount).toFixed(2)}
        </span>
      </div>
    </>
  );
}
