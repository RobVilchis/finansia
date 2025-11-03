"use client";

import { useChat } from "@ai-sdk/react";
import { TextArea } from "@radix-ui/themes";
import { UIMessage } from "ai";
import { useState } from "react";
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
  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <h1 className="m-4 text-2xl  text-gray-900 dark:text-white mb-8">
        Haz una pregunta
      </h1>
      <div className="h-[370px]  md:h-[350px] overflow-y-auto p-4 space-y-4">
        {messages?.map((message: UIMessage) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              {message.parts.map((part: MessagePart, index: number) =>
                part.type === "text" ? (
                  <span key={index}>
                    <Markdown>{part.text}</Markdown>
                  </span>
                ) : null
              )}
              {/* {message.parts.map((part: any, index: number) =>
                part.type === "text" ? (
                  <span key={index}>{part.text}</span>
                ) : null
              )} */}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className=" p-4"
      >
        <div className="flex gap-2">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre tus gastos..."
            className="flex-1 min-h-[44px] max-h-32 rounded-lg border dark:border-gray-700 bg-transparent px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
