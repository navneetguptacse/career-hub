"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  Plus,
  Send,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-14 border-b border-[#202937] bg-[#12171F] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
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

      <div className="flex items-center gap-3">
        {user?.telegramConnected ? (
          <Link
            href="/settings"
            className="hidden md:flex items-center gap-1.5 px-2 py-1 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs"
          >
            <Send className="w-3 h-3" />
            <span>Telegram Bot Connected</span>
          </Link>
        ) : (
          <Link
            href="/settings"
            className="hidden md:flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:text-[#5499EB] bg-[#18202C] border border-[#202937] hover:border-[#3178C6]/50 rounded-xs transition-colors"
          >
            <Send className="w-3 h-3 text-[#3178C6]" />
            <span>Connect Telegram</span>
          </Link>
        )}

        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Job</span>
        </Button>

        <div className="h-4 w-px bg-[#202937]" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <UserIcon className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="max-w-30 truncate hidden md:inline">
              {user?.email}
            </span>
            {user?.role === "ADMIN" && (
              <span className="flex items-center gap-1 text-[10px] text-[#FACC15] bg-[#EAB308]/15 border border-[#EAB308]/30 px-1 py-0.2 rounded-xs">
                <ShieldCheck className="w-2.5 h-2.5" />
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#18202C] rounded-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
