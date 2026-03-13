"use client";

import { Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import TipDialog from "./TipDialog";
import { useToast } from "./GenericToast";

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
  const { showToast } = useToast();

  const fetchTips = async () => {
    try {
      const response = await fetch("/api/tips");
      if (response.ok) {
        const data = await response.json();
        setTips(data);
      }
    } catch (error) {
      console.error("Failed to fetch tips:", error);
      showToast({
        title: "Error al cargar tips",
        message: "No se pudieron obtener los tips financieros.",
        variant: "error",
      });
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
        showToast({
          title: "Error al generar tips",
          message: "No se pudieron generar los tips. Intenta de nuevo.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to generate tips:", error);
      showToast({
        title: "Error al generar tips",
        message: "No se pudieron generar los tips. Intenta de nuevo.",
        variant: "error",
      });
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
          {generating ? "Generando..." : "Generar nuevos tips"}
        </Button>
      </div>

      {tips.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-500 mb-4 px-10">
            Aún no se han generado tips
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {tips.slice(0, 3).map((tip) => (
            <div key={tip.id}>
              <div
                className="w-full h-18 px-3 py-3 rounded-md line-clamp-5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50
                dark:hover:bg-blue-950 transition font-medium text-slate-900 dark:text-blue-200
                border border-transparent hover:border-blue-300 dark:hover:border-blue-700
                cursor-pointer active:scale-[0.98] flex items-center justify-between gap-2"
                onClick={() => {
                  setSelectedTip(tip);
                  setDialogOpen(true);
                }}
              >
                <span className="line-clamp-2">{tip.title}</span>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
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
