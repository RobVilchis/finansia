"use client";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import { useTransactions } from "./TransactionsContext";
import { useRouter } from "next/navigation";

import { UIMessage } from "ai";

type UseChatReturn = ReturnType<typeof useChat>;
type SendMessage = UseChatReturn["sendMessage"];

// Use loose typing to avoid version mismatch issues
interface ChatContextType {
    messages: UIMessage[];
    sendMessage: SendMessage;
    //isLoading: boolean;
    isSheetOpen: boolean;
    setIsSheetOpen: Dispatch<SetStateAction<boolean>>;
    // input: string;
    // handleInputChange: (e: any) => void;
    // handleSubmit: (e: any) => void;
    setMessages: (messages: UIMessage[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { refreshTransactions } = useTransactions();
    const router = useRouter();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const chat = useChat({
        // Automatically submit when all tool results are available
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

        onToolCall: ({ toolCall }) => {
            if (toolCall.dynamic) {
                return;
            }

            const mutationTools = [
                "createTransaction",
                "deleteTransactions",
                "updateTransaction",
                "createAccount",
                "updateAccount",
                "deleteAccount",
                "createGoal",
                "updateGoal",
                "deleteGoal",
                "createCategory",
                "updateCategory",
                "deleteCategory",
            ];

            if (mutationTools.includes(toolCall.toolName)) {
                refreshTransactions();
                router.refresh();
            }
        },
    });

    return (
        <ChatContext.Provider
            value={{
                messages: chat.messages,
                sendMessage: chat.sendMessage,
                // isLoading: chat.isLoading,
                isSheetOpen,
                setIsSheetOpen,
                // input: chat.input,
                // handleInputChange: chat.handleInputChange,
                // handleSubmit: chat.handleSubmit,
                setMessages: chat.setMessages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}
