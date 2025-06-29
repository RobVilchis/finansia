"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ExpenseData {
  categoryName: string;
  totalAmount: string;
}

interface ExpensesPieChartProps {
  refreshTrigger?: number;
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
}: ExpensesPieChartProps) {
  const [data, setData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/pie-chart");
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Expenses by Category (This Month)
        </h3>
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

  return (
    <div className="bg-white dark:bg-transparent rounded-lg p-4 ">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Expenses by Category (This Month)
      </h3>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Total: ${totalExpenses.toFixed(2)}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            /* label={({ percent }) =>
              `${percent ? (percent * 100).toFixed(0) : 0}%`
            } */
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
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
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
