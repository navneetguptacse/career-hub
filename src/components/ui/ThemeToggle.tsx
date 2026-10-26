"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = "sm",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        disabled
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors rounded-xs border text-xs gap-1.5 focus:outline-none border-[#202937] bg-[#12171F] opacity-70 cursor-default",
          size === "sm" ? "h-8 px-2.5" : "h-9 px-3",
          className
        )}
      >
        <span
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            "inline-block shrink-0"
          )}
        />
        {showLabel && <span className="capitalize">Theme</span>}
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors rounded-xs border text-xs gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3178C6]",
        size === "sm" ? "h-8 px-2.5" : "h-9 px-3",
        isDark
          ? "border-[#202937] bg-[#12171F] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] hover:border-[#3178C6]/50"
          : "border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-[#3178C6]",
        className
      )}
    >
      {isDark ? (
        <Sun
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            "text-[#FACC15] shrink-0"
          )}
        />
      ) : (
        <Moon
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            "text-[#3178C6] shrink-0"
          )}
        />
      )}
      {showLabel && (
        <span className="capitalize">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};
