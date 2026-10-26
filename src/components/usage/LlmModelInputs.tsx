"use client";

import React from "react";
import type { ProviderType, ProviderMeta } from "./LlmProviderSelector";

interface LlmModelInputsProps {
  provider: ProviderType;
  endpoint: string;
  setEndpoint: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  meta: ProviderMeta;
}

export const LlmModelInputs: React.FC<LlmModelInputsProps> = ({
  provider,
  endpoint,
  setEndpoint,
  model,
  setModel,
  meta,
}) => {
  if (provider === "CUSTOM") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#94A3B8]">
            Custom API Base URL
          </label>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://api.groq.com/openai/v1"
            className="w-full h-9 px-3 text-xs bg-[#0A0D12] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#94A3B8]">
            Model Name
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="llama-3.3-70b-versatile"
            className="w-full h-9 px-3 text-xs bg-[#0A0D12] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] font-mono"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[#94A3B8]">
        Custom Model Override
      </label>
      <input
        type="text"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        placeholder={`${meta.defaultModel}`}
        className="w-full h-9 px-3 text-xs bg-[#0A0D12] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] font-mono"
      />
    </div>
  );
};
