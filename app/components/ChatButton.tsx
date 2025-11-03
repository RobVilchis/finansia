"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import ChatUI from "./ChatUI";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";

export default function ChatButton() {
  const { messages, sendMessage } = useChat({
    // Automatically submit when all tool results are available
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed md:right-10 md:bottom-10 bg-gray-200  dark:bg-gray-600 rounded-lg p-3 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
          />
        </svg>
      </button>
      <div
        className={`fixed bottom-30 right-8 ml-8 md:bottom-16 md:right-35 md:w-md transition-all duration-200 ${
          chatOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChatUI messages={messages} sendMessage={sendMessage} />
      </div>
    </>
  );
}
