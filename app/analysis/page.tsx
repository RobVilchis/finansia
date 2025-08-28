"use client";

import { useChat } from "@ai-sdk/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import ChatUI from "../components/ChatUI";
import ExpensesPieChart from "../components/ExpensesPieChart";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Analysis() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const [chatOpen, setChatOpen] = useState<boolean>(false);
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

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed right-8 bottom-8 md:right-16 md:bottom-16 bg-gray-600 rounded-lg p-3 flex items-center justify-center hover:bg-gray-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
        </button>
        <div
          className={`bottom-30 right-8 ml-8 md:bottom-16 md:right-35 md:w-md transition-all transition-discrete ${
            chatOpen ? "fixed" : "hidden"
          }`}
        >
          <ChatUI
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
