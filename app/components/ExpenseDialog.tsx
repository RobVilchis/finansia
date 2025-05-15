'use client';

import * as Dialog from '@radix-ui/react-dialog';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: {
    concept: string;
    date: string;
    amount: number;
    category: string;
  };
}

export default function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Expense Details
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Concept</h3>
              <p className="text-lg text-gray-900 dark:text-white">{expense.concept}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h3>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${expense.amount.toFixed(2)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
              <p className="text-lg text-gray-900 dark:text-white">{expense.date}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
              <span className="inline-block mt-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {expense.category}
              </span>
            </div>
          </div>

          <Dialog.Close className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03157 3.2184C3.80702 2.99385 3.44295 2.99385 3.2184 3.2184C2.99385 3.44295 2.99385 3.80702 3.2184 4.03157L6.68682 7.50005L3.2184 10.9685C2.99385 11.193 2.99385 11.5571 3.2184 11.7816C3.44295 12.0062 3.80702 12.0062 4.03157 11.7816L7.50005 8.31322L10.9685 11.7816C11.193 12.0062 11.5571 12.0062 11.7816 11.7816C12.0062 11.5571 12.0062 11.193 11.7816 10.9685L8.31322 7.50005L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 