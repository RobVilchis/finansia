"use client";

import { useEffect, useState } from "react";
import DashboardGoalsList from "../components/DashboardGoalsList";
import ExpensesPieChart from "../components/ExpensesPieChart";
import HomeAccountsList from "../components/HomeAccountsList";
import NewTransactionDialog from "../components/NewTransactionDialog";
import TipsList from "../components/TipsList";
import RecentTransactions from "../components/RecentTransactions";
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight, X } from "lucide-react";

interface Summary {
  totalBalance: number;
  monthIncome: number;
  monthExpenses: number;
  recentTransactions: {
    id: string;
    description: string | null;
    amount: string;
    date: string;
    type: string;
    categoryName: string | null;
    sourceAccountName: string | null;
    targetAccountName: string | null;
  }[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  valueColor = "text-white",
  prefix = "$",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  valueColor?: string;
  prefix?: string;
}) {
  const formatted = Math.abs(value).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-white/30" />
        <span className="text-xs text-white/30 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-xl font-semibold font-mono tabular-nums ${valueColor}`}>
        {value < 0 ? "-" : ""}{prefix}{formatted}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tipsDismissed, setTipsDismissed] = useState(false);

  useEffect(() => {
    fetch("api/create-user");
  }, []);

  useEffect(() => {
    fetch("/api/summary")
      .then((r) => r.json())
      .then(setSummary)
      .catch(console.error);
  }, [refreshTrigger]);

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const handleAddTransaction = () => {
    setTransactionDialogOpen(false);
    setRefreshTrigger((v) => v + 1);
  };

  const monthNet = summary ? summary.monthIncome - summary.monthExpenses : 0;

  return (
    <div className="min-h-screen bg-gray-950 font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Inicio</h1>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Balance total"
          value={summary?.totalBalance ?? 0}
          icon={Wallet}
          valueColor="text-white"
        />
        <StatCard
          label="Ingresos del mes"
          value={summary?.monthIncome ?? 0}
          icon={TrendingUp}
          valueColor="text-emerald-400"
        />
        <StatCard
          label="Gastos del mes"
          value={summary?.monthExpenses ?? 0}
          icon={TrendingDown}
          valueColor="text-rose-400"
        />
        <StatCard
          label="Neto del mes"
          value={monthNet}
          icon={ArrowLeftRight}
          valueColor={monthNet >= 0 ? "text-emerald-400" : "text-rose-400"}
        />
      </div>

      {/* Chart + Recent transactions */}
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
            Transacciones recientes
          </h2>
          <RecentTransactions transactions={summary?.recentTransactions ?? []} />
        </section>
      </div>

      {/* Accounts */}
      <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
          Saldos actuales
        </h2>
        <HomeAccountsList onAccountAdded={() => {}} />
      </section>

      {/* Goals */}
      <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
          Progreso de metas
        </h2>
        <DashboardGoalsList />
      </section>

      {/* Tips — dismissible */}
      {!tipsDismissed && (
        <section className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest">
              Tips de esta semana
            </h2>
            <button
              onClick={() => setTipsDismissed(true)}
              className="p-1 text-white/20 hover:text-white/50 transition-colors cursor-pointer rounded-md hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <TipsList />
        </section>
      )}

      <NewTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
