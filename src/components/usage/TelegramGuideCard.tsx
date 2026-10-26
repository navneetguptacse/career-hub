"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Users,
  MessageSquare,
  Terminal,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TelegramBotFatherTip } from "./TelegramBotFatherTip";
import { TelegramCommandsTable } from "./TelegramCommandsTable";

export const TelegramGuideCard: React.FC = () => {
  const [pairToken, setPairToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  useEffect(() => {
    async function fetchPairToken() {
      try {
        const res = await fetch("/api/telegram/pair");
        if (res.ok) {
          const data = await res.json();
          setPairToken(data.pairToken || null);
        }
      } catch (err) {
        console.error("Failed to load pair token:", err);
      } finally {
        setIsLoadingToken(false);
      }
    }
    fetchPairToken();
  }, []);

  const handleCopyCommand = () => {
    const textToCopy = pairToken ? `/link ${pairToken}` : "/link <YOUR_CODE>";
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://t.me/careerhub_tracker_bot");
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2000);
  };

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202937] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              Telegram Bot Integration Guide
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Automate link ingestion into your personal pipeline from direct
              messages or group chats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://t.me/careerhub_tracker_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-[#3178C6] hover:bg-[#235A97] rounded-xs transition-colors shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Open Bot on Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Primary Availability Announcement Banner */}
      <div className="p-4 bg-[#0A0D12] border border-[#3178C6]/40 rounded-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs flex gap-1.5 items-center font-semibold text-[#F1F5F9]">
              <Terminal className="w-4 h-4 text-[#3178C6]" />
              Yes, the bot is publicly available to anyone on Telegram.
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Anyone in the world can search for{" "}
              <code className="text-[#5499EB] font-mono font-semibold bg-[#12171F] px-1.5 py-0.5 border border-[#202937] rounded-xs">
                @careerhub_tracker_bot
              </code>{" "}
              or open{" "}
              <a
                href="https://t.me/careerhub_tracker_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5499EB] hover:underline font-mono inline-flex items-center gap-1 font-medium"
              >
                t.me/careerhub_tracker_bot
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 text-xs px-2.5 text-[#94A3B8] hover:text-[#F1F5F9] border border-[#202937] shrink-0 self-start sm:self-auto"
          >
            {isCopiedLink ? (
              <Check className="w-3 h-3 text-[#3178C6]" />
            ) : (
              <Copy className="w-3 h-3" strokeWidth={2.4} />
            )}
            <span>{isCopiedLink ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      {/* Quick Pairing Token Card */}
      <div className="p-4 bg-[#0A0D12] border border-[#3178C6]/40 rounded-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs flex gap-1.5 items-center font-semibold text-[#F1F5F9]">
              <Terminal className="w-4 h-4 text-[#3178C6]" />
              Your Personal Linking Command
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Send this exact command to the bot in a direct message or group to
              link your account:{" "}
              <span className="font-mono text-[10px] font-semibold text-[#5499EB]">
                {isLoadingToken
                  ? "Generating..."
                  : pairToken
                    ? `/link ${pairToken}`
                    : "/link <PAIR-CODE>"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCopyCommand}
              disabled={!pairToken}
              className="h-8 text-xs px-3"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase font-mono tracking-wider border-b border-[#202937] pb-2">
          How It Works for Any User:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 1-on-1 */}
          <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F1F5F9]">
              <div className="w-6 h-6 rounded-xs bg-[#3178C6]/20 border border-[#3178C6]/40 flex items-center justify-center text-[#5499EB]">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span>1. In Private Direct Messages</span>
            </div>

            <div className="text-xs text-[#334155] dark:text-[#CBD5E1] space-y-2 leading-relaxed">
              <p>
                Any person can start a direct chat with{" "}
                <strong className="text-[#0F172A] dark:text-[#F1F5F9] font-mono">
                  @careerhub_tracker_bot
                </strong>
                .
              </p>
              <p>
                If they send{" "}
                <code className="text-[#1D4ED8] text-[10px] dark:text-[#5499EB] font-mono font-semibold">
                  /start
                </code>{" "}
                without linking, the bot welcomes them and instructs them to get
                a code from CareerHub:
              </p>
              <div className="p-2.5 bg-[#12171F] border-l-2 border-[#3178C6] border-y border-r rounded-xs text-xs text-[#334155] dark:text-[#CBD5E1]">
                Welcome to CareerHub Bot! To connect this chat with your
                account, please send:{" "}
                <span className="font-mono text-[10px] text-[#1D4ED8] dark:text-[#5499EB] not-italic font-semibold">
                  /link PAIR-XXXXXX
                </span>
              </div>
              <p>
                Once they create an account on your website, copy their code
                from{" "}
                <span className="text-[#0F172A] dark:text-[#F1F5F9] font-medium font-mono">
                  /settings
                </span>
                , and send{" "}
                <code className="text-[#1D4ED8] text-[10px] dark:text-[#5499EB] font-mono font-semibold">
                  /link PAIR-XXXXXX
                </code>
                , the bot links specifically to them.
              </p>
            </div>
          </div>

          {/* Card 2: Groups */}
          <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F1F5F9]">
              <div className="w-6 h-6 rounded-xs bg-[#3178C6]/20 border border-[#3178C6]/40 flex items-center justify-center text-[#5499EB]">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>2. In Groups</span>
            </div>

            <div className="text-xs text-[#334155] dark:text-[#CBD5E1] space-y-2 leading-relaxed">
              <p>
                Any user can add{" "}
                <strong className="text-[#0F172A] dark:text-[#F1F5F9] font-mono">
                  @careerhub_tracker_bot
                </strong>{" "}
                to their own private or public job search group.
              </p>
              <p>
                Sending{" "}
                <code className="text-[#1D4ED8] text-[10px] dark:text-[#5499EB] font-mono font-semibold">
                  /link PAIR-XXXXXX
                </code>{" "}
                in that group connects the group chat to their CareerHub
                pipeline.
              </p>
              <p>
                Any job link posted by members in the group is parsed by the AI
                engine and saved directly as an application card for that user.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Privacy */}
        <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F1F5F9]">
            <div className="w-6 h-6 rounded-xs bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>3. Security &amp; Privacy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
            <div className="p-3 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
              <div className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>No Database Pollution</span>
              </div>
              <p className="text-[#94A3B8]">
                An unlinked stranger cannot pollute your database: if someone
                who hasn&apos;t paired sends a link, the bot ignores it and
                prompts them to link their CareerHub account first.
              </p>
            </div>

            <div className="p-3 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
              <div className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Isolated User Pipelines</span>
              </div>
              <p className="text-[#94A3B8]">
                Each user&apos;s data is strictly isolated to their own unique
                user ID. Group chats route applications only to the specific
                pipeline of the user who executed the link command.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BotFather Tip Notice */}
      <TelegramBotFatherTip />

      {/* Command Reference Table */}
      <TelegramCommandsTable />
    </div>
  );
};
