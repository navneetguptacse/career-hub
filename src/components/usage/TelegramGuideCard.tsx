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
  HelpCircle,
  Terminal,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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
            <span>Open in Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Primary Availability Announcement */}
      <div className="p-4 bg-[#0A0D12] border border-[#3178C6]/40 rounded-xs space-y-2">
        <p className="text-sm font-semibold text-[#F1F5F9]">
          Yes, the bot is publicly available to anyone on Telegram.
        </p>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Anyone in the world can search for{" "}
          <code className="text-[#5499EB] font-mono bg-[#12171F] px-1.5 py-0.5 border border-[#202937] rounded-xs">
            @careerhub_tracker_bot
          </code>{" "}
          or open{" "}
          <a
            href="https://t.me/careerhub_tracker_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5499EB] hover:underline font-mono inline-flex items-center gap-1"
          >
            t.me/careerhub_tracker_bot
            <ExternalLink className="w-3 h-3" />
          </a>
          .
        </p>
        <div className="pt-1 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-7 text-[11px] px-2 text-[#94A3B8] border border-[#202937]"
          >
            {isCopiedLink ? (
              <Check className="w-3 h-3 text-[#10B981]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>Copy Bot Link</span>
          </Button>
        </div>
      </div>

      {/* Quick Pairing Token Card */}
      <div className="p-4 bg-[#16263D]/40 border border-[#3178C6]/50 rounded-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-[#F1F5F9] flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#3178C6]" />
              Your Personal Link Command
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Send this command to the bot in a direct message or group chat to
              pair your account.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="px-2.5 py-1 text-xs font-mono font-bold bg-[#0A0D12] text-[#5499EB] border border-[#3178C6]/40 rounded-xs">
              {isLoadingToken
                ? "Loading..."
                : pairToken
                  ? `/link ${pairToken}`
                  : "/link <GENERATE_IN_SETTINGS>"}
            </code>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyCommand}
              disabled={!pairToken}
              className="h-7 text-xs px-2.5"
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
      </div>

      {/* How It Works Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase font-mono tracking-wider">
          How It Works for Any User:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: 1-on-1 */}
          <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]">
              <MessageSquare className="w-4 h-4 text-[#3178C6]" />
              <span>1. Private Direct Messages (1-on-1)</span>
            </div>
            <ul className="text-xs text-[#94A3B8] space-y-1.5 leading-relaxed">
              <li>Any person can start a chat with @careerhub_tracker_bot.</li>
              <li>
                If they send <code className="text-[#5499EB]">/start</code>{" "}
                without linking, the bot welcomes them and instructs:
              </li>
              <li className="p-2 bg-[#12171F] border border-[#202937] rounded-xs text-[11px] text-[#cbd5e1] italic font-mono">
                &ldquo;Welcome to CareerHub Bot! To connect this chat with your
                account, please send: /link PAIR-XXXXXX&rdquo;
              </li>
              <li>
                Once they create an account, copy their code, and send it, the
                bot links specifically to them.
              </li>
            </ul>
          </div>

          {/* Card 2: Groups */}
          <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]">
              <Users className="w-4 h-4 text-[#3178C6]" />
              <span>2. In Groups</span>
            </div>
            <ul className="text-xs text-[#94A3B8] space-y-1.5 leading-relaxed">
              <li>
                Any user can add @careerhub_tracker_bot to their own private or
                public job search group.
              </li>
              <li>
                Sending{" "}
                <code className="text-[#5499EB]">/link PAIR-XXXXXX</code> in
                that group connects the group to their CareerHub pipeline.
              </li>
              <li>
                Any job link posted by group members is immediately parsed and
                added to that pipeline.
              </li>
            </ul>
          </div>

          {/* Card 3: Security & Privacy */}
          <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>3. Security &amp; Privacy</span>
            </div>
            <ul className="text-xs text-[#94A3B8] space-y-1.5 leading-relaxed">
              <li>
                An unlinked stranger cannot pollute your database: if someone
                who hasn&apos;t paired sends a link, the bot ignores it and
                prompts them to link their CareerHub account first.
              </li>
              <li>
                Each user&apos;s data is strictly isolated to their own user ID.
              </li>
              <li>Encrypted auth guarantees multi-tenant security.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* BotFather Tip Notice */}
      <div className="p-4 bg-[#0A0D12] border border-[#EAB308]/40 rounded-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#FACC15]">
          <Info className="w-4 h-4 text-[#EAB308]" />
          <span>Group Link Detection Note (/setprivacy in @BotFather)</span>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          If users want the bot to auto-detect links in Telegram groups without
          needing to make the bot an admin or @mention it:
        </p>
        <ol className="list-decimal list-inside text-xs text-[#94A3B8] space-y-1 font-mono pl-1">
          <li>Open @BotFather on Telegram.</li>
          <li>
            Send <span className="text-[#F1F5F9]">/setprivacy</span> &rarr;
            select{" "}
            <span className="text-[#5499EB]">@careerhub_tracker_bot</span>{" "}
            &rarr; choose <strong className="text-[#10B981]">Disable</strong>.
          </li>
          <li>
            This allows the bot to read links posted in any group it is added
            to. (In 1-on-1 private messages, this is already enabled by
            default).
          </li>
        </ol>
      </div>

      {/* Command Reference */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#3178C6]" />
          Supported Telegram Commands Reference
        </h3>

        <div className="overflow-x-auto border border-[#202937] rounded-xs bg-[#0A0D12]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#202937] text-[#64748B] font-mono uppercase text-[12px]">
              <tr>
                <th className="px-3.5 py-2">Command</th>
                <th className="px-3.5 py-2">Context</th>
                <th className="px-3.5 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202937] text-xs">
              <tr>
                <td className="px-3.5 py-2 font-mono text-[#5499EB]">/start</td>
                <td className="px-3.5 py-2 text-[#94A3B8]">DM or Group</td>
                <td className="px-3.5 py-2 text-[#F1F5F9]">
                  Welcome message and instructions on linking
                </td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono text-[#5499EB]">
                  /link &lt;PAIR-XXXXXX&gt;
                </td>
                <td className="px-3.5 py-2 text-[#94A3B8]">DM or Group</td>
                <td className="px-3.5 py-2 text-[#F1F5F9]">
                  Links this chat to your CareerHub pipeline
                </td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono text-[#5499EB]">
                  /status
                </td>
                <td className="px-3.5 py-2 text-[#94A3B8]">DM or Group</td>
                <td className="px-3.5 py-2 text-[#F1F5F9]">
                  Checks connection status and total ingested applications
                </td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono text-[#5499EB]">
                  /unlink
                </td>
                <td className="px-3.5 py-2 text-[#94A3B8]">DM or Group</td>
                <td className="px-3.5 py-2 text-[#F1F5F9]">
                  Disconnects this chat from your CareerHub account
                </td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono text-[#5499EB]">/help</td>
                <td className="px-3.5 py-2 text-[#94A3B8]">DM or Group</td>
                <td className="px-3.5 py-2 text-[#F1F5F9]">
                  Lists instructions for dropping job URLs and pairing tokens
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
