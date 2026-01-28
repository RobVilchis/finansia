"use client";

import { Toast } from "radix-ui";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ToastVariant = "error" | "success" | "info" | "warning";

interface ToastContextType {
  showToast: (options: {
    title: string;
    message: string;
    variant?: ToastVariant;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<ToastVariant>("info");

  const showToast = useCallback(
    ({
      title,
      message,
      variant = "info",
    }: {
      title: string;
      message: string;
      variant?: ToastVariant;
    }) => {
      setTitle(title);
      setMessage(message);
      setVariant(variant);
      setOpen(true);
    },
    [],
  );

  const getVariantClasses = (variant: ToastVariant) => {
    switch (variant) {
      case "error":
        return "bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500";
      case "success":
        return "bg-green-50 dark:bg-green-950/50 border-l-4 border-green-500";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/50 border-l-4 border-yellow-500";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-950/50 border-l-4 border-blue-500";
    }
  };

  const getTitleClasses = (variant: ToastVariant) => {
    switch (variant) {
      case "error":
        return "text-red-800 dark:text-red-200";
      case "success":
        return "text-green-800 dark:text-green-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      case "info":
      default:
        return "text-blue-800 dark:text-blue-200";
    }
  };

  const getMessageClasses = (variant: ToastVariant) => {
    switch (variant) {
      case "error":
        return "text-red-700 dark:text-red-300";
      case "success":
        return "text-green-700 dark:text-green-300";
      case "warning":
        return "text-yellow-700 dark:text-yellow-300";
      case "info":
      default:
        return "text-blue-700 dark:text-blue-300";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root
          className={`px-5 py-4 min-w-[280px] max-w-[420px] rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-right-right animate-duration-300 animate-ease-in-out ${getVariantClasses(
            variant,
          )}`}
          open={open}
          onOpenChange={setOpen}
        >
          <Toast.Title
            className={`font-semibold text-base mb-1 ${getTitleClasses(
              variant,
            )}`}
          >
            {title}
          </Toast.Title>
          <Toast.Description asChild>
            <span
              className={`text-sm leading-relaxed block ${getMessageClasses(
                variant,
              )}`}
            >
              {message}
            </span>
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="pointer-events-none fixed bottom-4 right-24 z-2147483647 m-0 flex w-auto md:w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

// Backward compatibility - keep the old component but make it simpler
export const GenericToastProvider = ({
  open,
  setOpen,
  title,
  classNames,
  description,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  classNames: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Toast.Provider swipeDirection="right">
      {children}
      <Toast.Root
        className={`w-30 h-20 rounded-md animate-slide-in-right-right animate-duration-300 animate-ease-in-out ${classNames}`}
        open={open}
        onOpenChange={setOpen}
      >
        <Toast.Title className="ToastTitle">{title}</Toast.Title>
        <Toast.Description asChild>
          <span>{description}</span>
        </Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="ToastViewport" />
    </Toast.Provider>
  );
};
