import type { Metadata } from "next";
import { Geist, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerHub — Precision Job Application Tracker",
  description:
    "Track, organize, and automate job applications with Kanban boards, Telegram bot ingestion, and real-time career analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${robotoMono.variable} dark`}
    >
      <body className="min-h-screen font-sans antialiased selection:bg-[#3178C6] selection:text-white transition-colors duration-150">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
