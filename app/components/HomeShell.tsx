"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardGoalsList from "@/app/components/DashboardGoalsList";
import ExpensesPieChart from "@/app/components/ExpensesPieChart";
import HomeAccountsList from "@/app/components/HomeAccountsList";
import IncomeExpensesBarChart, {
  type MonthlySummaryItem,
} from "@/app/components/IncomeExpensesBarChart";
import NewTransactionDialog from "@/app/components/NewTransactionDialog";
import TipsList from "@/app/components/TipsList";

interface HomeShellProps {
  monthlySummary: MonthlySummaryItem[];
  startDate: Date;
  endDate: Date;
}

export default function HomeShell({
  monthlySummary,
  startDate,
  endDate,
}: HomeShellProps) {
  const router = useRouter();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const handleAddTransaction = () => {
    setTransactionDialogOpen(false);
    setRefreshTrigger((v) => v + 1);
    router.refresh();
  };

  return (
    <div className="w-full px-5 md:px-10 p-4 pb-28">
      <h1 className="text-3xl font-bold mb-6">Inicio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">
            Gastos por categoría (mes actual)
          </h2>
          <ExpensesPieChart
            refreshTrigger={refreshTrigger}
            startDate={startDate}
            endDate={endDate}
          />
        </section>
        <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Tips de esta semana</h2>
          <TipsList />
        </section>
      </div>
      <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Ingresos vs Gastos</h2>
          <p className="text-sm text-ink-subtle mt-0.5">Últimos 6 meses</p>
        </div>
        <IncomeExpensesBarChart data={monthlySummary} />
      </section>
      <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Saldos actuales</h2>
        </div>
        <HomeAccountsList onAccountAdded={() => {}} />
      </section>
      <section className="rounded-lg p-4 shadow-sm border-2 border-slate-200 dark:border-slate-800 mb-6">
        <h2 className="text-xl font-semibold mb-4">Progreso de metas</h2>
        <DashboardGoalsList />
      </section>
      <NewTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
