'use client';

import { useState } from 'react';
import ExpenseDialog from './ExpenseDialog';

interface ExpenseCardProps {
  concept: string;
  date: string;
  amount: number;
  category: string;
}

export default function ExpenseCard({ concept, date, amount, category }: ExpenseCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div 
        className="w-full flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm 
         p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md 
        transition-shadow  dark:hover:bg-gray-700 transition-color"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex justify-between gap-4 items-start ">
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-1">
              {concept}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {date}
            </p>
          </div>
          <span className="text-xs mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {category}
          </span>
        </div>
        
        <span className="text-lg font-bold text-green-600 dark:text-green-400">
            ${amount.toFixed(2)}
          </span>
      </div>
    </>
  );
} 