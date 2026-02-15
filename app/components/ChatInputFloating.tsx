"use client";

import { useChatContext } from "../contexts/ChatContext";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatInputFloating() {
    const { sendMessage, setIsSheetOpen, isSheetOpen } = useChatContext();
    const [input, setInput] = useState("");
    const [bottomOffset, setBottomOffset] = useState(24); // 24px = bottom-6

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
            className="fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 transition-[bottom] duration-150"
            style={{ bottom: `${bottomOffset}px` }}
        >
            <form
                onSubmit={handleSubmit}
                className="relative h-16 flex items-center bg-white dark:bg-slate-900 
                   border border-gray-200 dark:border-gray-700
                   rounded-xl focus-within:border-slate-500!
                   shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Haz una pregunta…"
                    className="focus:outline-none flex-1 bg-transparent py-3 pl-6 pr-12 
                     text-sm md:text-base 
                     text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 p-2 bg-gray-900 dark:bg-slate-500 text-white 
                     rounded-full hover:bg-gray-800 dark:hover:bg-slate-600 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowUp className="w-4 h-4" />
                    <span className="sr-only">Send</span>
                </button>
            </form>
        </div>
    );
}
