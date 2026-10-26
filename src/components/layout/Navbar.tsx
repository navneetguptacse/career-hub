"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  PanelLeft,
  Plus,
  Send,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useTelegramStatus } from "@/lib/hooks/useTelegramStatus";

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { data: session } = useSession();
  const { toggleMobileSidebar } = useSidebar();
  const { isPaired } = useTelegramStatus();
  const user = session?.user;
  const telegramConnected = isPaired || Boolean(user?.telegramConnected);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

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

        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-[#3178C6] flex items-center justify-center rounded-xs text-white font-mono font-bold text-sm shadow-xs transition-colors group-hover:bg-[#235A97]">
            CH
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#F1F5F9] hidden sm:inline-block">
            CareerHub
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Telegram status link */}
        {telegramConnected ? (
          <Link
            href="/settings"
            title="Telegram Bot Paired"
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-[#3178C6] bg-[#3178C6]/15 border border-[#3178C6] rounded-xs transition-colors hover:bg-[#3178C6]/25 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 fill-[#3178C6] text-[#3178C6]" />
          </Link>
        ) : (
          <Link
            href="/settings"
            title="Connect Telegram Bot"
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-[#94A3B8] hover:text-[#5499EB] bg-[#18202C] border border-[#202937] hover:border-[#3178C6]/50 rounded-xs transition-colors"
          >
            <Send className="w-3 h-3" />
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle size="sm" />

        {/* Add Quick Action */}
        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </Button>

        <div className="h-4 w-px bg-[#202937] hidden sm:block" />

        {/* Profile Button with explicit crisp border */}
        <Link
          href="/settings"
          title="Account & Profile Settings"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-[#F1F5F9] bg-[#0A0D12] border border-[#202937] hover:border-[#3178C6] hover:bg-[#18202C] rounded-xs transition-colors shadow-xs"
        >
          <UserIcon className="w-3.5 h-3.5 text-[#3178C6]" />
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
          onClick={() => setShowLogoutConfirm(true)}
          title="Sign out"
          aria-label="Sign out"
          className="h-8 w-8 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => !isLoggingOut && setShowLogoutConfirm(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to end your current session?"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            You will be signed out of CareerHub on this browser. You can log
            back in at any time with your credentials.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202937]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isLoggingOut}
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
