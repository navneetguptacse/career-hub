"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { TelegramGuideCard } from "@/components/usage/TelegramGuideCard";

export default function UsagePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#3178C6]" />
              <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
                Usage &amp; Ingestion Guide
              </h1>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Complete guide to Telegram bot pairing and automated job
              pipeline ingestion.
            </p>
          </div>
        </div>
      </div>

      {/* Telegram Bot Integration Guide */}
      <TelegramGuideCard />
    </div>
  );
}
