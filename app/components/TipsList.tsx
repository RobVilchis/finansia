"use client";

import { Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import TipDialog from "./TipDialog";

interface Tip {
  id: string;
  title: string;
  fullText: string;
  category: string;
  generatedAt: string;
  month: string;
}

export default function TipsList() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const fetchTips = async () => {
    try {
      const response = await fetch("/api/tips");
      if (response.ok) {
        const data = await response.json();
        setTips(data);
      }
    } catch (error) {
      console.error("Failed to fetch tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewTips = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/cron/");
      if (response.ok) {
        const data = await response.json();
        if (data.tips) {
          // Tips are now saved immediately, so we can fetch them right away
          await fetchTips();
        }
      } else {
        console.error("Failed to generate tips");
      }
    } catch (error) {
      console.error("Failed to generate tips:", error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  /*   const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "expenses":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "goals":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  }; */

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={generateNewTips} disabled={generating}>
          {generating ? "Generating..." : "Generate New Tips"}
        </Button>
      </div>

      {tips.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4 px-10">
            No tips generated yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tips.slice(0, 3).map((tip) => (
            <li key={tip.id}>
              <button
                className="w-full text-left px-3 py-2 rounded dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 transition font-medium text-blue-700 dark:text-blue-200 border border-transparent hover:border-blue-300 dark:hover:border-blue-700"
                onClick={() => {
                  setSelectedTip(tip);
                  setDialogOpen(true);
                }}
              >
                {tip.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedTip && (
        <TipDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={selectedTip.title}
          description={selectedTip.fullText}
          category={selectedTip.category}
        />
      )}
    </div>
  );
}
