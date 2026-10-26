"use client";

import React from "react";
import { BookOpen, Cpu, Send } from "lucide-react";
import { LlmConfigCard } from "@/components/usage/LlmConfigCard";
import { TelegramGuideCard } from "@/components/usage/TelegramGuideCard";

export default function UsagePage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#3178C6]" />
              <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
                Usage &amp; System Guide
              </h1>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Configure your personal LLM reasoning provider with encrypted API
              key storage, and follow the complete guide to Telegram bot
              ingestion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo("llm-config-section")}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] bg-[#0A0D12] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-[#3178C6]" />
              <span>Provider</span>
            </button>
            <button
              onClick={() => scrollTo("telegram-guide-section")}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] bg-[#0A0D12] hover:bg-[#18202C] border border-[#202937] rounded-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#5499EB]" />
              <span>Usage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: LLM Configuration */}
      <section id="llm-config-section">
        <LlmConfigCard />
      </section>

      {/* Section 2: Telegram Bot Integration Guide */}
      <section id="telegram-guide-section">
        <TelegramGuideCard />
      </section>
    </div>
  );
}
