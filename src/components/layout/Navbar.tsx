"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Send,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSidebar } from "@/components/providers/SidebarProvider";

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const user = session?.user;

  return (
    <header className="h-14 border-b border-[#202937] bg-[#12171F] px-3 md:px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
          className="md:hidden h-8 w-8 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Desktop sidebar show/hide trigger */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={isCollapsed ? "Show (Expand)" : "Hide (Collapse)"}
          aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
          className="hidden md:inline-flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4 text-[#3178C6]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-[#3178C6] flex items-center justify-center rounded-xs text-white font-mono font-bold text-sm shadow-xs transition-colors group-hover:bg-[#235A97]">
            CH
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#F1F5F9] hidden sm:inline-block">
            CareerHub
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#3178C6]/15 text-[#5499EB] border border-[#3178C6]/30 rounded-xs">
            v1.0
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Telegram status link */}
        {user?.telegramConnected ? (
          <Link
            href="/settings"
            title="Telegram Bot Paired"
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs font-mono"
          >
            <Send className="w-3 h-3" />
            <span>Bot Paired</span>
          </Link>
        ) : (
          <Link
            href="/settings"
            title="Connect Telegram Bot"
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-[#94A3B8] hover:text-[#5499EB] bg-[#18202C] border border-[#202937] hover:border-[#3178C6]/50 rounded-xs transition-colors font-mono"
          >
            <Send className="w-3 h-3 text-[#3178C6]" />
            <span>Connect Bot</span>
          </Link>
        )}

        {/* Dark / Light Mode Toggle with standardized h-8 button height */}
        <ThemeToggle size="sm" />

        {/* Add Job Quick Action */}
        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Job</span>
        </Button>

        <div className="h-4 w-px bg-[#202937] hidden sm:block" />

        {/* Profile Link and Info */}
        <Link
          href="/settings"
          title="Account & Profile Settings"
          className="inline-flex items-center gap-1.5 h-8 px-2 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-transparent hover:border-[#202937] rounded-xs transition-colors"
        >
          <UserIcon className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="max-w-28 truncate hidden lg:inline font-mono">
            {user?.name || user?.email?.split("@")[0]}
          </span>
          {user?.role === "ADMIN" && (
            <span className="flex items-center gap-1 text-[10px] text-[#FACC15] bg-[#EAB308]/15 border border-[#EAB308]/30 px-1 py-0.2 rounded-xs font-mono">
              <ShieldCheck className="w-2.5 h-2.5" />
              ADMIN
            </span>
          )}
        </Link>

        {/* Sign Out Action with standardized h-8 button height */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          aria-label="Sign out"
          className="h-8 w-8 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
