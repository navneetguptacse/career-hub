"use client";

import React, { useState, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WebhookStatusData {
  configured: boolean;
  telegramUrl: string;
  expectedUrl: string;
  isSynced: boolean;
  pendingUpdates: number;
  lastError: string | null;
  lastErrorDate: string | null;
}

export const TelegramWebhookSync: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<WebhookStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/telegram/webhook/status");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn("Failed to retrieve webhook status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !data) {
      fetchStatus();
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/telegram/webhook/status", {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        setSyncFeedback("Webhook successfully synchronized with Telegram.");
        await fetchStatus();
      } else {
        setSyncFeedback(json.error || "Failed to synchronize webhook.");
      }
    } catch {
      setSyncFeedback("Failed to synchronize webhook with Telegram.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="pt-3 border-t border-[#202937]">
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full flex items-center justify-between text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors py-1 select-none"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Activity className="w-3.5 h-3.5 text-[#3178C6]" />
          <span>Webhook Diagnostics & Domain Sync</span>
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
          <span>{isOpen ? "Hide" : "Inspect"}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 p-3.5 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F1F5F9] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#3178C6]" />
              <span>Telegram Webhook Route</span>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchStatus}
                isLoading={isLoading}
                icon={<RefreshCw className="w-3 h-3 text-[#94A3B8]" />}
                className="h-7 px-2 text-[11px]"
              >
                <span>Refresh</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSync}
                isLoading={isSyncing}
                icon={<RefreshCw className="w-3 h-3" />}
                className="h-7 px-2.5 text-[11px]"
              >
                <span>Sync Webhook</span>
              </Button>
            </div>
          </div>

          {syncFeedback && (
            <div className="p-2 text-xs rounded-xs bg-[#3178C6]/10 border border-[#3178C6]/30 text-[#5499EB]">
              {syncFeedback}
            </div>
          )}

          {data && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#12171F] border border-[#202937] rounded-xs space-y-0.5">
                  <div className="text-[#64748B]">Active Telegram Target</div>
                  <div className="font-mono text-[#F1F5F9] truncate font-medium">
                    {data.telegramUrl || "None (Webhook Not Set)"}
                  </div>
                </div>

                <div className="p-2 bg-[#12171F] border border-[#202937] rounded-xs space-y-0.5">
                  <div className="text-[#64748B]">Current App URL</div>
                  <div className="font-mono text-[#5499EB] truncate font-medium">
                    {data.expectedUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#12171F] border border-[#202937] rounded-xs">
                <span className="text-[#94A3B8] text-[11px]">Status</span>
                {data.isSynced && !data.lastError ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981] font-medium font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    Target in Sync (0 Pending)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#EF4444] font-medium font-mono">
                    <AlertCircle className="w-3 h-3" />
                    {data.lastError ? "Delivery Error" : "Domain Mismatch"}
                  </span>
                )}
              </div>

              {data.lastError && (
                <div className="p-2 text-[11px] bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] rounded-xs space-y-0.5 font-mono">
                  <div className="font-semibold">Last Delivery Error:</div>
                  <div className="truncate">{data.lastError}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
