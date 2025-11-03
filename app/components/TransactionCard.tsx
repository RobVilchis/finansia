"use client";

interface TransactionCardProps {
  description: string;
  date: string;
  amount: number;
  showCategory?: boolean;
  categoryName: string;
  type: string;
  sourceAccountName: string | null;
  targetAccountName: string | null;
}

export default function TransactionCard({
  description,
  date,
  amount,
  showCategory = true,
  categoryName,
  type,
}: TransactionCardProps) {
  let amountColor = "";
  if (type === "income") amountColor = "text-green-600 dark:text-green-400";
  else if (type === "expense") amountColor = "text-red-600 dark:text-red-400";
  else amountColor = "text-blue-600 dark:text-blue-400";

  return (
    <>
      <div
        className="w-full flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm \
         p-3 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md \
        transition-shadow  dark:hover:bg-slate-700 transition-color"
      >
        <div className="flex justify-between gap-4 items-start ">
          <div>
            <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {description}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{date}</p>
          </div>
          {type != "transfer" && showCategory && (
            <span className="text-xs mt-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
              {categoryName}
            </span>
          )}
        </div>
        <span className={`text-lg font-bold ${amountColor}`}>
          ${amount.toFixed(2)}
        </span>
      </div>
    </>
  );
}
