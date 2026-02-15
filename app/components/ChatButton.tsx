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
import {
  Sparkles
} from "lucide-react";
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
    <div
      onClick={() => setIsSheetOpen(true)}
      className="hidden md:flex fixed right-10 bottom-10 h-14 w-14 bg-gray-200 dark:bg-gray-600 
      rounded-lg p-3 items-center justify-center hover:bg-gray-300 
      dark:hover:bg-gray-500 transition-colors cursor-pointer z-50"
    >
      <Sparkles />
    </div>
  );

  if (isDesktop) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          {TriggerButton}
        </SheetTrigger>
        <SheetContent className="w-[50vw]! sm:max-w-[1200px]!">
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
          </SheetHeader>
          <ChatUI messages={messages} sendMessage={sendMessage} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <DrawerTrigger asChild>
        {TriggerButton}
      </DrawerTrigger>
      <DrawerContent className="h-[85dvh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Chat</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 flex-1 min-h-0">
          <ChatUI messages={messages} sendMessage={sendMessage} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
