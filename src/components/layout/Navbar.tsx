"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Keyboard,
  PanelLeft,
  Plus,
  Send,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useTelegramStatus } from "@/lib/hooks/useTelegramStatus";

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenShortcuts,
}) => {
  const { data: session } = useSession();
  const { toggleMobileSidebar } = useSidebar();
  const { isPaired } = useTelegramStatus();
  const user = session?.user;
  const telegramConnected = isPaired || Boolean(user?.telegramConnected);

  return (
    <header className="h-14 border-b border-[#202937] bg-[#12171F] px-3 md:px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
          className="md:hidden h-8 w-8 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 group shrink-0 h-8"
        >
          <Image
            src="/icons/icon.svg"
            alt="Career Hub"
            width={32}
            height={32}
            className="w-8 h-8 rounded-xs shadow-xs shrink-0 transition-opacity group-hover:opacity-90"
            priority
          />
          <span className="font-semibold text-sm tracking-tight text-[#F1F5F9] hidden sm:inline-block">
            Career Hub
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 h-8">
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

        <ThemeToggle size="sm" />

        <PwaInstallButton size="sm" compact />

        <button
          type="button"
          onClick={
            onOpenShortcuts ||
            (() => window.dispatchEvent(new Event("careerhub:open-shortcuts")))
          }
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard shortcuts"
          className="hidden lg:inline-flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:text-[#5499EB] hover:bg-[#18202C] border border-[#202937] hover:border-[#3178C6] rounded-xs transition-colors shadow-xs"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        <Button
          onClick={onOpenAddModal}
          size="sm"
          title="Add Application"
          className="gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </Button>

        <div className="h-4 w-px bg-[#202937] hidden sm:block" />

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
      </div>
    </header>
  );
};
