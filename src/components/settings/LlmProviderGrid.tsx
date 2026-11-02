"use client";

import React from "react";
import { CheckCircle2, Plus, Sliders } from "lucide-react";
import { PRESET_PROVIDERS, type ProviderType } from "./LlmPresets";
import { cn } from "@/lib/utils";

interface LlmProviderGridProps {
  selectedProvider: ProviderType;
  onSelectProvider: (provider: ProviderType) => void;
}

export const LlmProviderGrid: React.FC<LlmProviderGridProps> = ({
  selectedProvider,
  onSelectProvider,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#F1F5F9]">
          Select Provider
        </label>
        <button
          type="button"
          onClick={() => onSelectProvider("CUSTOM")}
          className={cn(
            "h-7 px-2.5 text-xs font-medium rounded-xs border transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer",
            selectedProvider === "CUSTOM"
              ? "bg-[#3178C6] border-[#3178C6] text-white"
              : "bg-[#0A0D12] border-[#202937] text-[#94A3B8] hover:text-[#5499EB] hover:border-[#3178C6] hover:bg-[#18202C]"
          )}
          title="Configure a custom OpenAI-compatible provider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provider</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESET_PROVIDERS.map((opt) => {
          const isSelected = selectedProvider === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectProvider(opt.id)}
              className={cn(
                "p-3 text-left border rounded-xs transition-colors flex items-center justify-between cursor-pointer",
                isSelected
                  ? "bg-[#3178C6]/15 border-[#3178C6] text-[#F1F5F9]"
                  : "bg-[#0A0D12] border-[#202937] text-[#94A3B8] hover:border-[#3178C6]/40 hover:bg-[#18202C]/50"
              )}
            >
              <div>
                <div className="text-xs font-semibold">{opt.name}</div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {opt.defaultModel}
                </div>
              </div>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-[#5499EB] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {selectedProvider === "CUSTOM" && (
        <div className="p-3 bg-[#3178C6]/10 border border-[#3178C6] rounded-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#5499EB] shrink-0" />
            <div>
              <span className="text-[#94A3B8] ml-2 text-[11px] hidden sm:inline">
                OpenAI-compatible endpoint (Groq, Ollama, Together, OpenRouter)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5499EB]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Configuring</span>
          </div>
        </div>
      )}
    </div>
  );
};
