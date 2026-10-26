"use client";

import React from "react";
import { Info, ChevronRight } from "lucide-react";

export const TelegramBotFatherTip: React.FC = () => {
  return (
    <div className="p-4 bg-[#0A0D12] border border-[#EAB308]/40 rounded-xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#FACC15]">
        <Info className="w-4 h-4 text-[#FACC15] shrink-0" />
        <span>
          Group Link Detection Note (
          <span className="font-mono">/setprivacy</span> in{" "}
          <span className="font-mono">@BotFather</span>)
        </span>
      </div>

      <p className="text-xs text-[#94A3B8] leading-relaxed">
        If users want the bot to auto-detect links in Telegram groups without
        needing to make the bot an admin or @mention it:
      </p>

      <div className="space-y-2">
        {/* Step 1 */}
        <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
          <span className="w-5 h-5 rounded-xs bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#FACC15] flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
            1
          </span>
          <span className="pt-0.5">
            Open{" "}
            <strong className="text-[#F1F5F9] font-mono">@BotFather</strong> on
            Telegram.
          </span>
        </div>

        {/* Step 2 with icon step progression */}
        <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
          <span className="w-5 h-5 rounded-xs bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#FACC15] flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
            2
          </span>
          <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
            <span>Send</span>
            <strong className="text-[#F1F5F9] font-mono">/setprivacy</strong>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>Select</span>
            <strong className="text-[#F1F5F9] font-mono">
              @careerhub_tracker_bot
            </strong>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>Choose</span>
            <strong className="text-[#F1F5F9] font-mono">Disable</strong>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
          <span className="w-5 h-5 rounded-xs bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#FACC15] flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
            3
          </span>
          <span className="pt-0.5">
            This allows the bot to read links posted in any group it is added
            to. (In 1-on-1 private messages, this is already enabled by
            default).
          </span>
        </div>
      </div>
    </div>
  );
};
