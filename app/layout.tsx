import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import ChatButton from "./components/ChatButton";
import MobileNavbar from "./components/MobileNavbar";
import { Sidebar } from "./components/Sidebar";
import { TransactionsProvider } from "./contexts/TransactionsContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ToastProvider } from "./components/GenericToast";
import ChatInputFloating from "./components/ChatInputFloating";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finansia",
  description: "Analiza tus finanzas personales con inteligencia artificial.",
};

// export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
        >
          <ThemeProvider attribute="class">
            <Theme appearance="inherit">
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
                      <div className="pt-14 md:pt-6 md:pl-80 w-full bg-white dark:bg-slate-950">
                        {children}
                      </div>
                    </section>
                    <ChatButton />
                    <ChatInputFloating />
                  </ChatProvider>
                </TransactionsProvider>
              </ToastProvider>
            </Theme>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
