"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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
}

/* Glass "window" panel: hairline sheen on the top edge + a chrome-style
   title bar with an optional meta detail on the right. */
function HomeSection({
  title,
  meta,
  delay = 0,
  className = "",
  children,
}: {
  title: string;
  meta?: string;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`home-reveal relative overflow-hidden rounded-2xl bg-surface backdrop-blur-md border border-edge ${className}`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-edge-strong to-transparent"
      />
      <header className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-3 border-b border-edge-soft">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {title}
        </h2>
        {meta && (
          <span className="text-[11px] uppercase tracking-wider text-ink-faint">
            {meta}
          </span>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function HomeShell({ monthlySummary }: HomeShellProps) {
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

  const monthLabel = new Date().toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen bg-app w-full px-5 md:px-10 py-8 pb-28 font-(family-name:--font-outfit)">
      {/* Ambient backdrop — gives the glass surfaces something to refract */}

      <div className="relative w-full max-w-6xl mx-auto">
        <header
          className="home-reveal mb-8"
          style={{ "--delay": "0ms" } as CSSProperties}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent-fg">
            {monthLabel}
          </p>
          <h1 className="mt-1.5 text-3xl md:text-4xl font-bold tracking-tight text-ink leading-none">
            Inicio
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <HomeSection title="Gastos por categoría" delay={60}>
            <ExpensesPieChart monthSwitcher refreshTrigger={refreshTrigger} />
          </HomeSection>
          <HomeSection title="Tips de esta semana" delay={120}>
            <TipsList />
          </HomeSection>
        </div>

        <HomeSection
          title="Ingresos vs gastos"
          meta="Últimos 6 meses"
          delay={180}
          className="mb-6"
        >
          <IncomeExpensesBarChart data={monthlySummary} />
        </HomeSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomeSection title="Saldos actuales" delay={240}>
            <HomeAccountsList onAccountAdded={() => {}} />
          </HomeSection>
          <HomeSection title="Progreso de metas" delay={300}>
            <DashboardGoalsList />
          </HomeSection>
        </div>
      </div>

      <NewTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onAddTransaction={handleAddTransaction}
      />

      <style>{`
        .home-reveal {
          animation: homeFadeUp 0.6s calc(var(--delay, 0ms)) cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes homeFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @media (prefers-reduced-motion: reduce) {
          .home-reveal { animation: none; }
        }
      `}</style>
    </div>
  );
}
