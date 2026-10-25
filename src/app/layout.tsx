import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
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
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#0A0D12] text-[#F1F5F9] font-sans antialiased selection:bg-[#3178C6] selection:text-white">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
