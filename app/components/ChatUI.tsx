"use client";

import { useChat } from "@ai-sdk/react";
import { TextArea } from "@radix-ui/themes";
import { UIMessage } from "ai";
import { ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";

type UseChatReturn = ReturnType<typeof useChat>;
type SendMessage = UseChatReturn["sendMessage"];
type MessagePart = UIMessage["parts"][number];

interface ChatUIProps {
  messages: UIMessage[];
  sendMessage: SendMessage;
}

export default function ChatUI({ messages, sendMessage }: ChatUIProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  console.log(messages[0])

  return (
    <div className="Z-20 w-full h-full sm:py-4 bg-none dark:bg-none rounded-lg shadow-lg flex  flex-col">
      {/* <h1 className="m-4 text-2xl  text-gray-900 dark:text-white mb-8">
        Haz una pregunta
      </h1> */}
      <div className="space-y-4 grow overflow-y-auto">
        {messages?.map((message: UIMessage) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
            >
              {message.parts.map((part: MessagePart, index: number) =>
                part.type === "text" ? (
                  <span key={index}>
                    <Markdown>{part.text}</Markdown>
                  </span>
                ) : null,
              )}
              {/* {message.parts.map((part: any, index: number) =>
                part.type === "text" ? (
                  <span key={index}>{part.text}</span>
                ) : null
              )} */}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="pb-4"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-full h-full flex items-end bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    sendMessage({ text: input });
                    setInput("");
                  }
                }
              }}
              resize="vertical"
              placeholder="Pregunta sobre tus gastos..."
              className="min-h-[60px]! max-h-[200px]! w-full border-0 bg-transparent px-4! py-3!  text-gray-900! dark:text-white! placeholder:text-gray-400! focus:outline-none focus:ring-0 resize-none"
              style={{ boxShadow: 'none', background: 'transparent' }}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className=" p-2 bg-gray-900 dark:bg-blue-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <ArrowUp className="w-5 h-5" />
            <span className="sr-only">Enviar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
