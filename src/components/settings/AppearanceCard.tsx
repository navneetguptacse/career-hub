"use client";

import React from "react";
import { Moon, Sun, Terminal, Eclipse } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export const AppearanceCard: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
          <Eclipse className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#F1F5F9]">Preferences</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Toggle theme modes, sidebar visibility, and inspect typography
            tokens.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Theme Mode Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#94A3B8] tracking-wide">
            Interface Theme
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "h-9 px-4 flex items-center justify-center gap-2 text-xs font-medium rounded-xs border transition-colors",
                theme === "dark"
                  ? "bg-[#3178C6] text-white border-[#3178C6] shadow-xs"
                  : "bg-[#0A0D12] text-[#94A3B8] border-[#202937] hover:border-[#3178C6]/50 hover:text-[#F1F5F9]"
              )}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Precision Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "h-9 px-4 flex items-center justify-center gap-2 text-xs font-medium rounded-xs border transition-colors",
                theme === "light"
                  ? "bg-[#3178C6] text-white border-[#3178C6] shadow-xs"
                  : "bg-[#0A0D12] text-[#94A3B8] border-[#202937] hover:border-[#3178C6]/50 hover:text-[#F1F5F9]"
              )}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Precision Light</span>
            </button>
          </div>
        </div>

        {/* Monospace Typography Callout */}
        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]">
            <Terminal className="w-3.5 h-3.5 text-[#3178C6]" />
            <span>Typography</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            All code blocks, metrics, timestamps, and currency amounts use
            Google Font Roboto Mono for high-legibility tabular alignment.
          </p>
        </div>
      </div>
    </div>
  );
};
