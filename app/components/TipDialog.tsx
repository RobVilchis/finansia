"use client";
import { Dialog } from "@radix-ui/themes";
import { Lightbulb } from "lucide-react";
import { glassDialogContent } from "./ui/glass";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  category?: string;
}

export default function TipDialog({
  open,
  onOpenChange,
  title,
  description,
  category,
}: TipDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="440px" className={glassDialogContent}>
        <div className="p-6 font-(family-name:--font-outfit)">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 shrink-0 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-cyan-400">
              <Lightbulb size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-base font-semibold text-white leading-tight m-0">
                {title}
              </Dialog.Title>
              {category && (
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-300">
                  {category}
                </span>
              )}
            </div>
          </div>
          <Dialog.Description className="text-sm text-white/70 leading-relaxed m-0">
            {description}
          </Dialog.Description>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
