"use client";

import React from "react";
import { HelpCircle, Terminal } from "lucide-react";

interface CommandItem {
  command: string;
  context: string;
  description: string;
}

const COMMANDS: CommandItem[] = [
  {
    command: "/start",
    context: "DM / GROUP",
    description:
      "Displays welcome message and step-by-step linking instructions.",
  },
  {
    command: "/link PAIR-XXXXXX",
    context: "DM / GROUP",
    description:
      "Connects this Telegram chat or group to your CareerHub pipeline.",
  },
  {
    command: "/status",
    context: "DM / GROUP",
    description:
      "Checks active connection status and total ingested job applications.",
  },
  {
    command: "/unlink",
    context: "DM / GROUP",
    description:
      "Disconnects this Telegram chat or group from your CareerHub account.",
  },
  {
    command: "/help",
    context: "DM / GROUP",
    description: "Lists instructions for posting job URLs and pairing tokens.",
  },
];

export const TelegramCommandsTable: React.FC = () => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-[#3178C6]" />
        <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase font-mono tracking-wider">
          Supported Telegram Commands Reference
        </h3>
      </div>

      <div className="overflow-x-auto border border-[#202937] rounded-xs bg-[#0A0D12]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#202937] text-[#94A3B8] font-mono uppercase text-[11px] bg-[#12171F]">
            <tr>
              <th className="px-4 py-3">Command</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Function &amp; Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202937]">
            {COMMANDS.map((item) => (
              <tr
                key={item.command}
                className="hover:bg-[#18202C]/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 text-[#5499EB] font-medium">
                    <span>{item.command}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-semibold text-[#94A3B8]">
                    {item.context}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#CBD5E1] text-xs leading-relaxed">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
