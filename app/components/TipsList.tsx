"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
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
        if (data.tips) await fetchTips();
      } else {
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

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 bg-white/5 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tips.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/30 text-sm mb-4">Aún no se han generado tips</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {tips.slice(0, 3).map((tip) => (
            <div
              key={tip.id}
              onClick={() => {
                setSelectedTip(tip);
                setDialogOpen(true);
              }}
              className="px-3 py-3 rounded-lg bg-white/6 border border-white/8
                hover:bg-white/10 hover:border-white/16 transition-all cursor-pointer
                flex items-center justify-between gap-2"
            >
              <span className="text-sm text-white/70 line-clamp-2">{tip.title}</span>
              <ChevronRight className="w-4 h-4 shrink-0 text-white/25" />
            </div>
          ))}
        </ul>
      )}

      <button
        onClick={generateNewTips}
        disabled={generating}
        className="flex items-center gap-2 px-3 py-2 text-xs text-white/40
          hover:text-white/70 border border-white/10 rounded-lg bg-white/5
          hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40
          disabled:cursor-not-allowed"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {generating ? "Generando..." : "Generar nuevos tips"}
      </button>

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
