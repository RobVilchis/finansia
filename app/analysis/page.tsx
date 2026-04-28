"use client";

import { useEffect, useState } from "react";
import ExpensesPieChart from "../components/ExpensesPieChart";
import { GlassCard, GlassInput, SectionHeading } from "../components/ui/glass";

export default function Analysis() {
  const [chartRefreshTrigger, setChartRefreshTrigger] = useState(0);

  const monthStart = new Date();
  monthStart.setDate(1);

  const [startDate, setStartDate] = useState<Date>(monthStart);
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    fetch("/api/create-user");
    setChartRefreshTrigger(0);
  }, []);

  useEffect(() => {
    setChartRefreshTrigger((prev) => prev + 1);
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-app font-(family-name:--font-outfit) w-full px-5 md:px-10 py-8">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-ink mb-6">Análisis</h1>

        <GlassCard className="p-5 w-full max-w-[700px]">
          <SectionHeading>Gastos por categoría</SectionHeading>
          <div className="flex gap-3 mt-3 mb-5">
            <div className="space-y-1.5">
              <p className="text-[11px] text-ink-subtle uppercase tracking-wider">
                Fecha de inicio
              </p>
              <GlassInput
                type="date"
                className="w-40 font-mono scheme-dark"
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] text-ink-subtle uppercase tracking-wider">
                Fecha de fin
              </p>
              <GlassInput
                type="date"
                className="w-40 font-mono scheme-dark"
                value={endDate.toISOString().split("T")[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
          </div>
          <ExpensesPieChart
            refreshTrigger={chartRefreshTrigger}
            startDate={startDate}
            endDate={endDate}
          />
        </GlassCard>
      </div>
    </div>
  );
}
