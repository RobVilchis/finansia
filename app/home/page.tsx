"use client";

import { useEffect, useState } from "react";
import DashboardGoalsList from "../components/DashboardGoalsList";
import ExpensesPieChart from "../components/ExpensesPieChart";
import HomeAccountsList from "../components/HomeAccountsList";
import NewTransactionDialog from "../components/NewTransactionDialog";
import TipsList from "../components/TipsList";

export default function DashboardPage() {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const handleAddTransaction = () => {
    setTransactionDialogOpen(false);
    setRefreshTrigger((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Inicio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5">
          <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
            Gastos por categoría — mes actual
          </h2>
          <ExpensesPieChart
            refreshTrigger={refreshTrigger}
            startDate={startDate}
            endDate={endDate}
          />
        </section>

        <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5">
          <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
            Tips de esta semana
          </h2>
          <TipsList />
        </section>
      </div>

      <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
          Saldos actuales
        </h2>
        <HomeAccountsList onAccountAdded={() => {}} />
      </section>

      <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
          Progreso de metas
        </h2>
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
