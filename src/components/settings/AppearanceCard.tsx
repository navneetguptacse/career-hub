"use client";

import React from "react";
import {
  Moon,
  Sun,
  PanelLeft,
  PanelLeftClose,
  Terminal,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

export const AppearanceCard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-5">
      <div className="border-b border-[#202937] pb-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3178C6]" />
          Appearance & Display Preferences
        </h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Toggle theme modes, sidebar visibility, and inspect typography tokens.
        </p>
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
              <span>Clean Light</span>
            </button>
          </div>
        </div>

        {/* Sidebar Display Controls */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#94A3B8] tracking-wide">
            Pipeline Sidebar Display
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) toggleSidebar();
              }}
              className={cn(
                "h-9 px-4 flex items-center justify-center gap-2 text-xs font-medium rounded-xs border transition-colors",
                !isCollapsed
                  ? "bg-[#3178C6] text-white border-[#3178C6] shadow-xs"
                  : "bg-[#0A0D12] text-[#94A3B8] border-[#202937] hover:border-[#3178C6]/50 hover:text-[#F1F5F9]"
              )}
            >
              <PanelLeft className="w-3.5 h-3.5" />
              <span>Show Sidebar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isCollapsed) toggleSidebar();
              }}
              className={cn(
                "h-9 px-4 flex items-center justify-center gap-2 text-xs font-medium rounded-xs border transition-colors",
                isCollapsed
                  ? "bg-[#3178C6] text-white border-[#3178C6] shadow-xs"
                  : "bg-[#0A0D12] text-[#94A3B8] border-[#202937] hover:border-[#3178C6]/50 hover:text-[#F1F5F9]"
              )}
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
              <span>Hide Sidebar (Full Width)</span>
            </button>
          </div>
        </div>

        {/* Monospace Typography Callout */}
        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]">
            <Terminal className="w-3.5 h-3.5 text-[#3178C6]" />
            <span>Console Typography Token: Roboto Mono</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            All code blocks, metrics, timestamps, and currency amounts use
            Google Font{" "}
            <code className="text-[#5499EB] font-mono px-1 py-0.5 bg-[#12171F] border border-[#202937] rounded-xs">
              Roboto_Mono
            </code>{" "}
            for high-legibility tabular alignment.
          </p>
        </div>
      </div>
    </div>
  );
};
