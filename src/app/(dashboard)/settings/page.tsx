"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  Copy,
  Database,
  KeyRound,
  Send,
  ShieldCheck,
  Unlink,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TelegramStatus {
  connected: boolean;
  chatId?: string | null;
  pairToken?: string | null;
  botUsername?: string | null;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchTelegramStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/telegram/pair");
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch Telegram status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/telegram/pair");
        if (res.ok && isMounted) {
          const data = await res.json();
          setTelegramStatus(data);
        }
      } catch (err) {
        console.error("Failed to load Telegram status:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyToken = () => {
    if (!telegramStatus?.pairToken) return;
    navigator.clipboard.writeText(`/link ${telegramStatus.pairToken}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to unlink Telegram?")) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/telegram/pair", { method: "DELETE" });
      if (res.ok) {
        await fetchTelegramStatus();
        await update({ user: { telegramConnected: false } });
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs">
        <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
          Platform Settings & Integrations
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Configure Telegram bot ingestion, manage authentication, and inspect
          account settings.
        </p>
      </div>

      {/* Telegram Bot Integration Card */}
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
        <div className="flex items-start justify-between border-b border-[#202937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">
                Telegram Ingestion Bot
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Paste job links in your Telegram group to automatically populate
                your Kanban board.
              </p>
            </div>
          </div>

          <div>
            {telegramStatus?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 rounded-xs">
                <Check className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs text-[#94A3B8] bg-[#18202C] border border-[#202937] rounded-xs">
                Not Paired
              </span>
            )}
          </div>
        </div>

        {telegramStatus?.connected ? (
          <div className="space-y-3">
            <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs text-xs space-y-1">
              <div className="text-[#94A3B8]">Connected Telegram Chat ID:</div>
              <div className="font-mono text-[#F1F5F9]">
                {telegramStatus.chatId}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              isLoading={isDisconnecting}
              className="text-[#EF4444] hover:border-[#EF4444] gap-1.5"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Unlink Telegram Bot</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2">
              <span className="text-xs font-medium text-[#94A3B8] block">
                Your Secure Pairing Command:
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-[#12171F] border border-[#202937] rounded-xs font-mono text-sm text-[#5499EB]">
                  {isLoading
                    ? "Generating..."
                    : `/link ${telegramStatus?.pairToken || "PAIR-XXXXXX"}`}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyToken}
                  className="gap-1.5 shrink-0"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#94A3B8]">
              <div className="font-semibold text-[#F1F5F9]">
                Setup Instructions:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[#94A3B8] pl-1">
                <li>
                  Open your Telegram bot client or add your bot to a group.
                </li>
                <li>
                  Send the command copied above:{" "}
                  <code className="text-[#5499EB]">
                    /link {telegramStatus?.pairToken}
                  </code>
                  .
                </li>
                <li>
                  Once linked, share any job link directly into that chat to add
                  it to your pipeline.
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Account & RBAC Card */}
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9] border-b border-[#202937] pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#3178C6]" />
          Account & Authentication Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">User Email</div>
            <div className="font-mono text-[#F1F5F9] font-medium">
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
              <KeyRound className="w-3.5 h-3.5 text-[#3178C6]" />
              JWT Strategy with NextAuth v5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
