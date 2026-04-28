"use client";

import { Plus } from "lucide-react";

export const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center h-10 w-10
        bg-accent-soft border border-accent-border text-accent-fg
        rounded-lg cursor-pointer transition-all
        hover:bg-accent/30 hover:text-cyan-100 hover:border-cyan-400/50"
      aria-label="Agregar"
    >
      <Plus className="w-4 h-4" />
    </button>
  );
};
