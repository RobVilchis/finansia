"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "./ui/states";

interface TooltipEntry {
  dataKey?: string | number;
  name?: string;
  value?: number;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}

export interface MonthlySummaryItem {
  month: string; // "YYYY-MM"
  income: number;
  expenses: number;
}

interface IncomeExpensesBarChartProps {
  data: MonthlySummaryItem[];
}

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "oklch(0.20 0.013 256)",
        border: "1px solid oklch(1 0 0 / 10%)",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "13px",
      }}
    >
      <p style={{ color: "oklch(1 0 0 / 70%)", marginBottom: 6 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.fill, margin: "2px 0" }}>
          {entry.name}: {formatMXN(entry.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex justify-center gap-6 pt-2">
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: "oklch(0.78 0.18 154)" }}
        />
        Ingresos
      </span>
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: "oklch(0.72 0.21 17)" }}
        />
        Gastos
      </span>
    </div>
  );
}

export default function IncomeExpensesBarChart({ data }: IncomeExpensesBarChartProps) {
  const isEmpty = data.every((d) => d.income === 0 && d.expenses === 0);
  if (isEmpty)
    return (
      <EmptyState
        compact
        icon={<BarChart3 size={18} />}
        title="Sin movimientos aún"
        description="Tus ingresos y gastos de los últimos 6 meses aparecerán aquí."
      />
    );

  const chartData = data.map((d) => ({
    label: MONTHS_ES[parseInt(d.month.split("-")[1], 10) - 1],
    income: d.income,
    expenses: d.expenses,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(1 0 0 / 8%)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: "oklch(1 0 0 / 40%)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fill: "oklch(1 0 0 / 40%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
        <Legend content={<CustomLegend />} />
        <Bar
          dataKey="income"
          name="Ingresos"
          fill="oklch(0.78 0.18 154)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Gastos"
          fill="oklch(0.72 0.21 17)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
