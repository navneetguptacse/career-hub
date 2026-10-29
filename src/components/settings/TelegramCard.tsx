"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  CircleCheck,
  Copy,
  RefreshCw,
  Send,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTelegramStatus } from "@/lib/hooks/useTelegramStatus";

export const TelegramCard: React.FC = () => {
  const { update } = useSession();
  const {
    isPaired,
    status: telegramStatus,
    isLoading,
    mutate,
    verifyConnection,
  } = useTelegramStatus({
    autoPollWhenUnpaired: true,
    pollInterval: 3000,
  });

  const [isCopied, setIsCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCopyToken = async () => {
    if (!telegramStatus?.pairToken) return;
    await navigator.clipboard.writeText(`/link ${telegramStatus.pairToken}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleManualVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyConnection();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to unlink your Telegram bot?")) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/telegram/pair", { method: "DELETE" });
      if (res.ok) {
        await mutate();
        await update({ user: { telegramConnected: false } });
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
      <div className="flex items-start justify-between border-b border-[#202937] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9]">
              Telegram Ingestion Bot
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Paste job links into Telegram chat to automatically ingest
              applications.
            </p>
          </div>
        </div>

        <div>
          {isPaired ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 rounded-xs">
              <CircleCheck className="w-3.5 h-3.5" />
              Paired
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#94A3B8] bg-[#18202C] border border-[#202937] rounded-xs">
              Not Paired
            </span>
          )}
        </div>
      </div>

      {isPaired ? (
        <div className="space-y-3">
          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs text-xs space-y-1">
            <div className="text-[#F1F5F9] font-medium">Telegram Connected</div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#94A3B8]">Chat ID:</span>
              <span className="font-mono text-[#F1F5F9]">
                {telegramStatus?.chatId ?? "Linked"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={handleDisconnect}
            isLoading={isDisconnecting}
            className="text-[#EF4444] hover:border-[#EF4444] gap-1.5"
          >
            <Unlink className="w-3.5 h-3.5" />
            <span>Unlink</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#94A3B8]">
                Secure Pairing Command
              </span>
              <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                <span className="w-1.5 h-1.5 rounded-xs bg-[#3178C6] animate-pulse" />
                <span>Auto-detecting link...</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 h-9 px-3 flex items-center bg-[#12171F] border border-[#202937] rounded-xs font-mono font-semibold text-xs text-[#5499EB] truncate">
                {isLoading
                  ? "Generating..."
                  : `/link ${telegramStatus?.pairToken ?? "PAIR-XXXXXX"}`}
              </code>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyToken}
                className="gap-1.5 shrink-0"
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
                ) : (
                  <Copy className="w-3 h-3" strokeWidth={2.5} />
                )}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleManualVerify}
                isLoading={isVerifying}
                title="Verify connection immediately"
                className="gap-1.5 shrink-0 border-[#202937] hover:border-[#3178C6]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#5499EB]" />
                <span className="hidden sm:inline">Verify</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#94A3B8]">
            <span className="text-xs font-medium text-[#94A3B8] block">
              Setup Instructions
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[#94A3B8] pl-1">
              <li>Open your Telegram bot client or add your bot to a group.</li>
              <li>Send the pairing command copied above.</li>
              <li>
                Connection will automatically reflect above once confirmed by
                the bot.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
