"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import ExpensesPieChart from "@/app/components/ExpensesPieChart";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

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
    <ThemeProvider theme={darkTheme}>
      <div className="flex container px-5 md:px-10 p-4 min-h-screen w-full">
        <div className="  w-full">
          {/* <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4"></h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyze your spending patterns and financial insights
            </p>
          </div> */}
          <div className="flex flex-col gap 2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Gastos por categoría
            </h3>
            <div className="flex gap-3 mb-5">
              <div className="space-y-1">
                <p className="opacity-70 text-sm">Fecha de inicio</p>
                <input
                  className="h-10 px-2 w-40 rounded-md bg-dark-50 border 
                border-neutral-600 focus:outline-2 focus:outline-blue-600"
                  type="date"
                  id="startDate"
                  value={startDate.toISOString().split("T")[0]}
                  onChange={(e) => {
                    setStartDate(new Date(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="opacity-70 text-sm">Fecha de fin</p>
                <input
                  className="h-10 px-2 w-40 rounded-md bg-dark-50 border 
                  border-neutral-600 focus:outline-2 focus:outline-blue-600"
                  type="date"
                  id="endDate"
                  value={endDate.toISOString().split("T")[0]}
                  onChange={(e) => {
                    setEndDate(new Date(e.target.value));
                  }}
                />
              </div>
            </div>
            <div className="w-full max-w-[500px]">
              <ExpensesPieChart
                refreshTrigger={chartRefreshTrigger}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
