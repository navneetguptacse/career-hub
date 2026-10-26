"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, User, UserRound } from "lucide-react";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { TelegramCard } from "@/components/settings/TelegramCard";
import { DangerZoneCard } from "@/components/settings/DangerZoneCard";

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
        <div className="flex items-start gap-3 border-b border-[#202937] pb-4">
          <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
            <UserRound className="w-4 h-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9]">
              Account Details
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Manage your account information and access permissions.
            </p>
          </div>
        </div>

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
        </div>
      </div>

      {/* Account Deletion & Danger Zone */}
      <DangerZoneCard />
    </div>
  );
}
