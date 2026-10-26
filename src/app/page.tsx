import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Kanban,
  LayoutDashboard,
  Lock,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F1F5F9] flex flex-col selection:bg-[#3178C6] selection:text-white">
      {/* Navigation Header */}
      <header className="h-14 border-b border-[#202937] bg-[#12171F]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#3178C6] flex items-center justify-center rounded-xs text-white font-mono font-bold text-xs shadow-xs">
            CH
          </div>
          <span className="font-bold text-sm tracking-tight text-[#F1F5F9]">
            CareerHub
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeToggle size="sm" />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                title="Account & Profile Settings"
                className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#F1F5F9] bg-[#12171F] hover:bg-[#18202C] border border-[#202937] hover:border-[#3178C6] rounded-xs transition-colors shrink-0"
              >
                <User className="w-3.5 h-3.5 text-[#3178C6]" />
                <span className="max-w-32.5 truncate hidden sm:inline">
                  {session?.user?.name || session?.user?.email}
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="h-8 px-3.5 inline-flex items-center justify-center text-xs font-medium bg-[#3178C6] hover:bg-[#235A97] text-white rounded-xs transition-colors shadow-xs gap-1.5 shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="h-8 px-3 inline-flex items-center justify-center text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] bg-[#12171F] hover:bg-[#18202C] border border-[#202937] hover:border-[#3178C6]/50 rounded-xs transition-colors"
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
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-12 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3178C6]/15 border border-[#3178C6]/40 text-[#5499EB] text-xs font-medium rounded-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#3178C6]" />
          <span>Automated Career Pipeline & Tracking</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F1F5F9] leading-tight max-w-4xl">
          Never Lose Track of a Role. <br />
          <span className="text-[#3178C6]">
            Capture & Organize Every Application.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
          A focused career tracker built to eliminate application chaos. Ingest
          job postings on the go directly from Telegram, extract details
          automatically, and manage your interviews in one organized workspace.
        </p>

        {/* Dynamic CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-10 px-6 bg-[#3178C6] hover:bg-[#235A97] text-white font-medium text-sm rounded-xs transition-colors shadow-md inline-flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/applications"
                className="w-full sm:w-auto h-10 px-6 bg-[#12171F] hover:bg-[#18202C] text-[#F1F5F9] border border-[#202937] hover:border-[#3178C6]/50 font-medium text-sm rounded-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                <Kanban className="w-4 h-4 text-[#3178C6]" />
                <span>View Applications</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto h-10 px-6 bg-[#3178C6] hover:bg-[#235A97] text-white font-medium text-sm rounded-xs transition-colors shadow-md inline-flex items-center justify-center gap-2"
              >
                <span>Start Tracking Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto h-10 px-6 bg-[#12171F] hover:bg-[#18202C] text-[#F1F5F9] border border-[#202937] hover:border-[#3178C6]/50 font-medium text-sm rounded-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Live Pipeline Preview Window */}
        <div className="w-full pt-8 text-left max-w-4xl">
          <div className="border border-[#202937] bg-[#12171F] rounded-xs overflow-hidden shadow-xl">
            {/* Window Topbar */}
            <div className="h-9 px-4 bg-[#0E131A] border-b border-[#202937] flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-[#EF4444]" />
                <span className="w-2 h-2 rounded-xs bg-[#EAB308]" />
                <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
                <span className="ml-2 font-medium text-[#94A3B8]">
                  Pipeline Preview
                </span>
              </div>
            </div>

            {/* Pipeline Preview Columns (clean background in both light and dark mode) */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0A0D12]">
              {/* Card 1 */}
              <div className="p-3.5 bg-[#12171F] border border-[#202937] rounded-xs space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F1F5F9]">
                      Staff Infrastructure Engineer
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]">Stripe</p>
                  </div>
                  <Badge status="INTERVIEW" size="sm" />
                </div>
                <div className="space-y-1 text-[11px] text-[#64748B] font-mono">
                  <div className="text-[#3178C6]">Remote · Worldwide</div>
                  <div>$190,000 – $240,000 USD</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-3.5 bg-[#12171F] border border-[#202937] rounded-xs space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F1F5F9]">
                      Systems Performance Lead
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]">Cloudflare</p>
                  </div>
                  <Badge status="SCREENING" size="sm" />
                </div>
                <div className="space-y-1 text-[11px] text-[#64748B] font-mono">
                  <div className="text-[#EAB308]">Hybrid · Austin, TX</div>
                  <div>$175,000 – $210,000 USD</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-3.5 bg-[#12171F] border border-[#202937] rounded-xs space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F1F5F9]">
                      Core Runtime Developer
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]">Vercel</p>
                  </div>
                  <Badge status="OFFER" size="sm" />
                </div>
                <div className="space-y-1 text-[11px] text-[#64748B] font-mono">
                  <div className="text-[#10B981]">Remote · United States</div>
                  <div>$185,000 – $225,000 USD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does & How It Helps You */}
      <section className="border-t border-[#202937] bg-[#0E131A] py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
              Everything You Need to Run an Organized Search
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
              Centralize every application in one unified workspace. Automate
              manual entry, track interview stages, and stay in total control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="p-5 bg-[#12171F] border border-[#202937] hover:border-[#3178C6]/50 transition-colors rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#3178C6]/15 border border-[#3178C6]/30 rounded-xs flex items-center justify-center text-[#5499EB]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Instant Link Parsing
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Submit any job posting link to automatically extract the company
                name, role title, salary range, and workplace model without
                manual typing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 bg-[#12171F] border border-[#202937] hover:border-[#3178C6]/50 transition-colors rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#5499EB]/15 border border-[#5499EB]/30 rounded-xs flex items-center justify-center text-[#5499EB]">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Telegram Ingestion
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Found an interesting opening on your phone? Forward or paste the
                link directly to your Telegram bot and it will automatically
                appear in your board.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 bg-[#12171F] border border-[#202937] hover:border-[#3178C6]/50 transition-colors rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xs flex items-center justify-center text-[#34D399]">
                <Kanban className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Board & Table Views
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Track status across Wishlist, Applied, Screening, Interview, and
                Offer columns. Toggle to a dense table to filter and search in
                bulk.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 bg-[#12171F] border border-[#202937] hover:border-[#3178C6]/50 transition-colors rounded-xs space-y-3">
              <div className="w-8 h-8 bg-[#EAB308]/15 border border-[#EAB308]/30 rounded-xs flex items-center justify-center text-[#FACC15]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Private & Secure
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Your application history, target compensation, custom notes, and
                interview dates remain completely private, encrypted, and under
                your ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#202937] py-6 px-4 sm:px-6 bg-[#0A0D12] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-[#3178C6] flex items-center justify-center rounded-xs text-white font-mono font-bold text-[10px]">
            CH
          </div>
          <p>&copy; 2026 CareerHub. All rights reserved.</p>
        </div>

        <div className="flex items-center gap-4 text-[#94A3B8] text-xs">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hover:text-[#F1F5F9] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/applications"
                className="hover:text-[#F1F5F9] transition-colors"
              >
                Applications
              </Link>
              <Link
                href="/settings"
                className="hover:text-[#F1F5F9] transition-colors"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-[#F1F5F9] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hover:text-[#F1F5F9] transition-colors"
              >
                Register
              </Link>
            </>
          )}
          <a
            href="https://github.com/navneetguptacse/career-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#5499EB] transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
