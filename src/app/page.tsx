import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Kanban,
  LockKeyhole,
  Send,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F1F5F9] flex flex-col selection:bg-[#3178C6] selection:text-white">
      {/* Navigation Header */}
      <header className="h-16 border-b border-[#202937] bg-[#12171F]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3178C6] flex items-center justify-center rounded-xs text-white font-mono font-bold text-sm shadow-xs">
            CH
          </div>
          <span className="font-bold text-base tracking-tight text-[#F1F5F9]">
            CareerHub
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link
            href="/login"
            className="h-8 px-3 inline-flex items-center justify-center text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] rounded-xs transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="h-8 px-3.5 inline-flex items-center justify-center text-xs font-medium bg-[#3178C6] hover:bg-[#235A97] text-white rounded-xs transition-colors shadow-xs gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#5499EB] text-xs font-mono font-semibold rounded-xs">
          <LockKeyhole className="w-3 h-3" strokeWidth={2.5} />
          <span>Career Hub – Powered by Telegram</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F1F5F9] leading-tight">
          Track Every Opportunity. <br />
          <span className="text-[#3178C6]">Auto-Ingest via Telegram.</span>
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
          The ultimate job tracking platform for developers. Seamlessly
          transition between Kanban boards and table views, capture job links
          directly through a Telegram bot, and measure your interview funnel.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto h-10 px-6 bg-[#3178C6] hover:bg-[#235A97] text-white font-medium text-sm rounded-xs transition-colors shadow-md inline-flex items-center justify-center gap-2"
          >
            <span>Launch Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto h-10 px-6 bg-[#12171F] hover:bg-[#18202C] text-[#F1F5F9] border border-[#202937] font-medium text-sm rounded-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2 bg-[#12171F] px-3 py-2 border border-[#202937] rounded-sm min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
            <span>OAuth (Google & GitHub)</span>
          </div>

          <div className="flex items-center gap-2 bg-[#12171F] px-3 py-2 border border-[#202937] rounded-sm min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3178C6] shrink-0" />
            <span>Email & Password with RBAC</span>
          </div>

          <div className="flex items-center gap-2 bg-[#12171F] px-3 py-2 border border-[#202937] rounded-sm min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
            <span>Neon PostgreSQL 18+ & Prisma</span>
          </div>

          <div className="flex items-center gap-2 bg-[#12171F] px-3 py-2 border border-[#202937] rounded-sm min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5499EB] shrink-0" />
            <span>Telegram Webhook Ingestion</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="border-t border-[#202937] bg-[#0E131A] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
              Built for Modern Software Engineering Searches
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              High-precision styling with near-sharp edges and zero clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB]">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Telegram Bot Webhook
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Connect your Telegram group or personal chat with a single
                command. Paste job links on the go and have OpenGraph metadata
                parsed into cards automatically.
              </p>
            </div>

            <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#10B981]/20 border border-[#10B981]/40 rounded-xs flex items-center justify-center text-[#34D399]">
                <Kanban className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Kanban & Table Views
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Manage your progression across Wishlist, Applied, Screening,
                Interview, and Offer columns. Toggle between a visual board and
                a dense data table.
              </p>
            </div>

            <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#EAB308]/20 border border-[#EAB308]/40 rounded-xs flex items-center justify-center text-[#FACC15]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Funnel Analytics
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Analyze submission conversion rates, average compensation
                distributions, and workplace preferences (Remote vs Hybrid vs
                On-site).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#202937] py-6 px-6 bg-[#0A0D12] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p>&copy; 2026 CareerHub. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-4 text-[#94A3B8]">
          <Link href="/login" className="hover:text-[#F1F5F9]">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-[#F1F5F9]">
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}
