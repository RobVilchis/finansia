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
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading chart...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 ">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No expenses found for this month
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: parseFloat(item.totalAmount),
    color: COLORS[index % COLORS.length],
  }));

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom legend renderer to preserve original order
  const renderCustomLegend = (props: Props) => {
    const { payload } = props;

    if (!payload || payload.length === 0) {
      return null;
    }

    return (
      <ul
        className={`recharts-legend-item-list flex flex-col flex-wrap ${
          isMediumOrLarge ? "h-fit w-30" : "h-36 w-80"
        }`}
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {payload.toReversed().map((category, index) => (
          <li
            key={`legend-item-${index}`}
            className="recharts-legend-item w-fit"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "4px",
              fontSize: "12px",
              color: "#ffffff",
            }}
          >
            <svg width="12" height="12" style={{ marginRight: "8px" }}>
              <rect
                width="12"
                height="12"
                fill={category.color}
                stroke="none"
              />
            </svg>
            <span>{category.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <div className="text-sm text-gray-600 dark:text-gray-400 ">
        Total: ${totalExpenses.toFixed(2)}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx={isMediumOrLarge ? "50%" : "45%"}
            cy="50%"
            labelLine={false}
            /* label={({ percent }) =>
              `${percent ? (percent * 100).toFixed(0) : 0}%`
            } */
            outerRadius={isMediumOrLarge ? 120 : 90}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={0.5}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
            labelStyle={{ color: "#000" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <Legend
            layout="vertical"
            verticalAlign={isMediumOrLarge ? "middle" : "bottom"}
            align={isMediumOrLarge ? "right" : "center"}
            wrapperStyle={{
              paddingRight: isMediumOrLarge ? "40px" : "",
              paddingTop: isMediumOrLarge ? "" : "15px",
            }}
            content={renderCustomLegend}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
