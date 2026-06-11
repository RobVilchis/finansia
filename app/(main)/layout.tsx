import ChatButton from "@/app/components/ChatButton";
import ChatInputFloating from "@/app/components/ChatInputFloating";
import { ToastProvider } from "@/app/components/GenericToast";
import MobileNavbar from "@/app/components/MobileNavbar";
import { Sidebar } from "@/app/components/Sidebar";
import { ChatProvider } from "@/app/contexts/ChatContext";
import { TransactionsProvider } from "@/app/contexts/TransactionsContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <TransactionsProvider>
        <ChatProvider>
          <div className="relative md:hidden z-50">
            <MobileNavbar />
          </div>
          <section className="flex">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <div className="pt-14 md:pt-6 md:pl-80 w-full bg-app">
              {children}
            </div>
          </section>
          <ChatButton />
          <ChatInputFloating />
        </ChatProvider>
      </TransactionsProvider>
    </ToastProvider>
  );
}
