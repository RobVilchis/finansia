"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";

interface TransactionsContextType {
  refreshTransactions: () => void;
  transactionUpdateCount: number;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactionUpdateCount, setTransactionUpdateCount] = useState(0);

  const refreshTransactions = useCallback(() => {
    setTransactionUpdateCount((prev) => prev + 1);
  }, []);

  return (
    <TransactionsContext.Provider
      value={{ refreshTransactions, transactionUpdateCount }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
}
