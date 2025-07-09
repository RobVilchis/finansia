"use client";
import { Dialog } from "@radix-ui/themes";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  category?: string;
}

export default function TipDialog({
  open,
  onOpenChange,
  title,
  description,
  category,
}: TipDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className=" bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <Dialog.Title className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </Dialog.Title>
        {category && (
          <span className="inline-block mb-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {category}
          </span>
        )}
        <Dialog.Description className="text-gray-700 dark:text-gray-200 mb-4">
          {description}
        </Dialog.Description>
        {/* <div className="flex justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
                Close
              </button>
            </Dialog.Close>
          </div> */}
      </Dialog.Content>
    </Dialog.Root>
  );
}
