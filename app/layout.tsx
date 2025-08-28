import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MobileNavbar from "./components/MobileNavbar";
import { Sidebar } from "./components/Sidebar";
import "./globals.css";
import ChatButton from "./components/ChatButton";

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
  description: "Generado por create next app",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
        >
          <ThemeProvider attribute="class">
            <Theme appearance="inherit">
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
            </Theme>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
