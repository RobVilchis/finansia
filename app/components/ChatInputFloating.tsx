"use client";

import { useChatContext } from "../contexts/ChatContext";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatInputFloating() {
  const { sendMessage, setIsSheetOpen, isSheetOpen } = useChatContext();
  const [input, setInput] = useState("");
  const [bottomOffset, setBottomOffset] = useState(24);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
      setBottomOffset(keyboardHeight > 0 ? keyboardHeight + 8 : 24);
    };

    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  if (isSheetOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
    setIsSheetOpen(true);
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 transition-[bottom] duration-150 font-(family-name:--font-outfit)"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center h-14 bg-gray-900/80 backdrop-blur-xl
          border border-white/10 rounded-2xl
          focus-within:border-cyan-400/40
          shadow-2xl shadow-black/40 transition-all duration-200"
      >
        <Sparkles className="absolute left-4 w-4 h-4 text-cyan-400/70 pointer-events-none" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale a tu asistente financiero…"
          className="focus:outline-none flex-1 bg-transparent py-3 pl-11 pr-14
            text-sm text-white/90 placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-2 p-2 bg-cyan-500/20 border border-cyan-500/30
            text-cyan-300 rounded-xl hover:bg-cyan-500/30 hover:text-cyan-200
            transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="sr-only">Enviar</span>
        </button>
      </form>
    </div>
  );
}
