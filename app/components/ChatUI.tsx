"use client";

import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Markdown from "react-markdown";

type UseChatReturn = ReturnType<typeof useChat>;
type SendMessage = UseChatReturn["sendMessage"];
type MessagePart = UIMessage["parts"][number];

interface ChatUIProps {
  messages: UIMessage[];
  sendMessage: SendMessage;
}

const SUGGESTIONS = [
  "¿Cuánto gasté este mes?",
  "Crear un gasto de $250 en comida",
  "Muéstrame mis últimas transferencias",
  "Resumen de mis finanzas",
];

export default function ChatUI({ messages, sendMessage }: ChatUIProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    sendMessage({ text });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="flex flex-col h-full w-full font-(family-name:--font-outfit)">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/6 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/10">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-medium text-white mb-1">
                ¿En qué te ayudo?
              </h3>
              <p className="text-xs text-white/40">
                Pregúntame sobre tus finanzas
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left text-sm text-white/70 px-3 py-2.5 bg-white/6 border border-white/10
                    rounded-xl hover:bg-white/10 hover:border-cyan-400/30 hover:text-white
                    transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message: UIMessage) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-cyan-500/15 border border-cyan-500/25 text-white/95"
                      : "bg-white/6 border border-white/10 text-white/85"
                  }`}
                >
                  {message.parts.map((part: MessagePart, index: number) =>
                    part.type === "text" ? (
                      <div key={index} className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-headings:text-white prose-strong:text-white">
                        <Markdown>{part.text}</Markdown>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="pt-3 pb-1"
      >
        <div className="relative flex items-end bg-white/6 backdrop-blur-md border border-white/10
          rounded-xl focus-within:border-cyan-400/40 transition-all overflow-hidden">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Pregunta sobre tus gastos..."
            className="min-h-[48px] max-h-[160px] w-full bg-transparent px-4 py-3 pr-12
              text-sm text-white/90 placeholder:text-white/30 focus:outline-none resize-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-cyan-500/20 border border-cyan-500/30
              text-cyan-300 rounded-lg hover:bg-cyan-500/30 hover:text-cyan-200
              transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="sr-only">Enviar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
