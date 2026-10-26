"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { PROVIDER_OPTIONS, type ProviderType } from "./LlmPresets";

interface LlmProviderGridProps {
  selectedProvider: ProviderType;
  onSelectProvider: (provider: ProviderType) => void;
}

export const LlmProviderGrid: React.FC<LlmProviderGridProps> = ({
  selectedProvider,
  onSelectProvider,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#F1F5F9]">
        Select Provider
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PROVIDER_OPTIONS.map((opt) => {
          const isSelected = selectedProvider === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectProvider(opt.id)}
              className={`p-3 text-left border rounded-xs transition-colors flex items-center justify-between ${
                isSelected
                  ? "bg-[#3178C6]/15 border-[#3178C6] text-[#F1F5F9]"
                  : "bg-[#0A0D12] border-[#202937] text-[#94A3B8] hover:border-[#3178C6]/40"
              }`}
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
    </div>
  );
};
