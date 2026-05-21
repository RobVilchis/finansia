"use client";

import { useEffect, useState } from "react";
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
import { ChartSkeleton, EmptyStateSkeleton } from "./LoadingSkeleton";

interface ExpenseData {
  categoryName: string;
  totalAmount: string;
}

interface ExpensesPieChartProps {
  refreshTrigger?: number;
  startDate: Date;
  endDate: Date;
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
}: ExpensesPieChartProps) {
  const [data, setData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bp = useBreakpoint();
  const isMediumOrLarge = bp === "md" || bp === "lg";

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
      const response = await fetch(`/api/pie-chart?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching pie chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (isLoading) return <ChartSkeleton />;
  if (data.length === 0) return <EmptyStateSkeleton />;

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
