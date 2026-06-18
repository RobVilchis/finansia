"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChartPie, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Cell,
  Legend,
  LegendPayload,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { ChartSkeleton } from "./LoadingSkeleton";
import { EmptyState, ErrorState } from "./ui/states";

interface ExpenseData {
  categoryName: string;
  totalAmount: string;
}

interface ExpensesPieChartProps {
  refreshTrigger?: number;
  startDate?: Date;
  endDate?: Date;
  monthSwitcher?: boolean;
}

interface Props {
  payload?: readonly LegendPayload[];
}

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#e879f9",
  "#38bdf8",
];

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ExpensesPieChart({
  refreshTrigger = 0,
  startDate,
  endDate,
  monthSwitcher = false,
}: ExpensesPieChartProps) {
  const [data, setData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const bp = useBreakpoint();
  const isMediumOrLarge = bp === "md" || bp === "lg";

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const isCurrentMonth =
    viewMonth.getFullYear() === currentMonth.getFullYear() &&
    viewMonth.getMonth() === currentMonth.getMonth();

  const monthLabel = viewMonth.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  const monthLabelDisplay =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const goToPrevMonth = () =>
    setViewMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
    );
  const goToNextMonth = () =>
    setViewMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
    );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      let rangeStart: Date;
      let rangeEnd: Date;
      if (monthSwitcher) {
        rangeStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
        rangeEnd = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
      } else {
        const fallback = new Date();
        rangeStart =
          startDate ??
          new Date(fallback.getFullYear(), fallback.getMonth(), 1);
        rangeEnd = endDate ?? fallback;
      }
      const params = new URLSearchParams({
        startDate: rangeStart.toISOString().split("T")[0],
        endDate: rangeEnd.toISOString().split("T")[0],
      });
      const response = await fetch(`/api/pie-chart?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching pie chart data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [monthSwitcher, viewMonth, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, fetchData]);

  const switcherHeader = monthSwitcher ? (
    <div className="flex items-center justify-between mb-4">
      <button
        type="button"
        onClick={goToPrevMonth}
        aria-label="Mes anterior"
        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-medium text-ink tabular-nums">
        {monthLabelDisplay}
      </span>
      <button
        type="button"
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        aria-label="Mes siguiente"
        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  ) : null;

  let body: ReactNode;
  if (isLoading) {
    body = <ChartSkeleton />;
  } else if (hasError) {
    body = (
      <ErrorState
        compact
        message="No se pudo cargar la gráfica de gastos."
        onRetry={fetchData}
      />
    );
  } else if (data.length === 0) {
    body = (
      <EmptyState
        compact
        icon={<ChartPie size={18} />}
        title="Sin gastos en este mes"
        description="Registra algunos gastos para ver la gráfica."
      />
    );
  } else {
    body = renderChart();
  }

  return (
    <div>
      {switcherHeader}
      {body}
    </div>
  );

  function renderChart() {
  const chartData = data
    .map((item) => ({
      name: item.categoryName,
      value: parseFloat(item.totalAmount),
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLegend = (props: Props) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;

    const sorted = [...payload].sort((a, b) => {
      const aVal = (a.payload as { value?: number })?.value ?? 0;
      const bVal = (b.payload as { value?: number })?.value ?? 0;
      return bVal - aVal;
    });

    return (
      <ul
        className={`recharts-legend-item-list flex flex-col flex-wrap ${isMediumOrLarge ? "h-fit w-44" : "h-36 w-80"
          }`}
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {sorted.map((category, index) => (
          <li
            key={`legend-item-${index}`}
            className="recharts-legend-item w-fit"
            style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}
          >
            <svg width="10" height="10" style={{ marginRight: "8px", flexShrink: 0 }}>
              <rect width="10" height="10" rx="2" fill={category.color} />
            </svg>
            <span className="text-xs font-medium text-ink-muted">
              {category.value}{" "}
              <span className="text-ink-faint font-mono">
                {formatMXN((category.payload as { value?: number })?.value ?? 0)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <p className="text-xs text-ink-subtle mb-3 font-mono tabular-nums">
        Total: {formatMXN(totalExpenses)}
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx={isMediumOrLarge ? "50%" : "45%"}
            cy="50%"
            labelLine={false}
            outerRadius={isMediumOrLarge ? 120 : 90}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatMXN(value), name]}
            contentStyle={{
              backgroundColor: "oklch(0.20 0.013 256)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "10px",
              color: "oklch(1 0 0)",
              fontSize: "13px",
            }}
            labelStyle={{ color: "oklch(1 0 0 / 70%)" }}
            itemStyle={{ color: "oklch(1 0 0)" }}
            cursor={{ fill: "oklch(1 0 0 / 4%)" }}
          />
          <Legend
            layout="vertical"
            verticalAlign={isMediumOrLarge ? "middle" : "bottom"}
            align={isMediumOrLarge ? "right" : "center"}
            wrapperStyle={{
              paddingRight: isMediumOrLarge ? "40px" : "",
              paddingLeft: !isMediumOrLarge ? "50px" : "",
              paddingTop: isMediumOrLarge ? "" : "15px",
            }}
            content={renderCustomLegend}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
  }
}
