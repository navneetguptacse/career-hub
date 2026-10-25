"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Database, Lock, ShieldCheck, User } from "lucide-react";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { TelegramCard } from "@/components/settings/TelegramCard";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs">
        <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
          Settings & Channels
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Manage your career profile, customize appearance, toggle pipeline
          sidebars, and configure automated Telegram ingestion.
        </p>
      </div>

      {/* User Profile & Career Identity */}
      <UserProfileCard />

      {/* Appearance & Interface Preferences */}
      <AppearanceCard />

      {/* Telegram Bot Integration */}
      <TelegramCard />

      {/* System Diagnostics & Authentication Details */}
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9] border-b border-[#202937] pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#3178C6]" />
          Account & Architecture Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">Authenticated Identity</div>
            <div className="font-mono text-[#F1F5F9] font-medium truncate">
              {session?.user?.email}
            </div>
          </div>

          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">Assigned Role (RBAC)</div>
            <div className="font-mono text-[#FACC15] flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {session?.user?.role || "USER"}
            </div>
          </div>

          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">Database Provider</div>
            <div className="font-mono text-[#10B981] flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              Neon PostgreSQL (Pooled)
            </div>
          </div>

          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">Session Architecture</div>
            <div className="font-mono text-[#94A3B8] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#3178C6]" />
              JWT Strategy with NextAuth v5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
