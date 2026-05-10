"use client";

import { useChatContext } from "../contexts/ChatContext";
import ChatUI from "./ChatUI";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Sparkles } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

export default function ChatButton() {
  const { messages, sendMessage, isSheetOpen, setIsSheetOpen } = useChatContext();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const TriggerButton = (
    <button
      onClick={() => setIsSheetOpen(true)}
      className="hidden md:flex fixed right-8 bottom-8 h-12 w-12
        bg-gray-900/80 backdrop-blur-xl border border-white/10
        rounded-full items-center justify-center
        hover:border-cyan-400/40 hover:bg-gray-900
        transition-all cursor-pointer z-50
        shadow-2xl shadow-cyan-500/10
        font-(family-name:--font-outfit)"
      aria-label="Abrir chat"
    >
      <Sparkles className="w-5 h-5 text-cyan-400" />
    </button>
  );

  if (isDesktop) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        <SheetContent className="w-[50vw]! sm:max-w-[1200px]! bg-gray-950! border-l! border-white/8! p-0! flex! flex-col! font-(family-name:--font-outfit)">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-white/8 space-y-0!">
            <SheetTitle className="text-xs font-medium text-white/30 uppercase tracking-widest text-left!">
              Asistente
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 px-4 pb-4">
            <ChatUI messages={messages} sendMessage={sendMessage} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent className="h-[85dvh] flex flex-col bg-gray-950! border-t! border-white/8! font-(family-name:--font-outfit)">
        <DrawerHeader className="px-5 pt-3 pb-2">
          <DrawerTitle className="text-xs font-medium text-white/30 uppercase tracking-widest text-left!">
            Asistente
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 flex-1 min-h-0">
          <ChatUI messages={messages} sendMessage={sendMessage} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
