"use client";

import { useState } from "react";
import DashboardGoalsList from "../components/DashboardGoalsList";
import ExpensesPieChart from "../components/ExpensesPieChart";
import HomeAccountsList from "../components/HomeAccountsList";
import NewTransactionDialog from "../components/NewTransactionDialog";
import TipsList from "../components/TipsList";
import ChatButton from "../components/ChatButton";

export default function DashboardPage() {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // For ExpensesPieChart, show last 30 days
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 29); // 30 days including today

  // When a new transaction is added, refresh the pie chart
  const handleAddTransaction = () => {
    setTransactionDialogOpen(false);
    setRefreshTrigger((v) => v + 1);
  };

  return (
    <div className="w-full px-5 md:px-10 p-4 ">
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">
            Expenses by category (last 30 days)
          </h2>
          <ExpensesPieChart
            refreshTrigger={refreshTrigger}
            startDate={startDate}
            endDate={endDate}
          />
        </section>
        <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">This week&apos;s tips</h2>
          <TipsList />
        </section>
      </div>
      <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current balances</h2>
        </div>
        <HomeAccountsList onAccountAdded={() => {}} />
      </section>
      <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800 mb-6">
        <h2 className="text-xl font-semibold mb-4">Goal progress</h2>
        <DashboardGoalsList />
      </section>
      <NewTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onAddExpense={handleAddTransaction}
      />
      <ChatButton />
    </div>
  );
}
