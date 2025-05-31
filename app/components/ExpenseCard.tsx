'use client';

interface TransactionCardProps {
  description: string;
  date: string;
  amount: number;
  categoryName: string;
  type: string;
  sourceAccountName: string | null;
  targetAccountName: string | null;
}

export default function TransactionCard({ description, date, amount, categoryName, type, sourceAccountName, targetAccountName }: TransactionCardProps) {
  let amountColor = "";
  if (type === "income") amountColor = "text-green-600 dark:text-green-400";
  else if (type === "expense") amountColor = "text-red-600 dark:text-red-400";
  else amountColor = "text-blue-600 dark:text-blue-400";
  
  return (
    <>
      <div 
        className="w-full flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm \
         p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md \
        transition-shadow  dark:hover:bg-gray-700 transition-color"
      >
        <div className="flex justify-between gap-4 items-start ">
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-1">
              {description}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {date}
            </p>
            {type === "transfer" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {sourceAccountName || "?"} {targetAccountName || "?"}
              </p>
            )}
          </div>
          <span className="text-xs mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {categoryName}
          </span>
        </div>
        <span className={`text-lg font-bold ${amountColor}`}>
          ${amount.toFixed(2)}
        </span>
      </div>
    </>
  );
} 