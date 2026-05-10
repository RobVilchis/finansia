import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
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
          className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased relative`}
        >
          <ThemeProvider attribute="class">
            <Theme appearance="inherit">{children}</Theme>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
