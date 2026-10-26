"use client";

import React from "react";
import { Check } from "lucide-react";

export type ProviderType = "GEMINI" | "OPENAI" | "ANTHROPIC" | "CUSTOM";

export interface ProviderMeta {
  id: ProviderType;
  name: string;
  placeholder: string;
  defaultModel: string;
  desc: string;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "GEMINI",
    name: "Google Gemini",
    placeholder: "AIzaSy...",
    defaultModel: "gemini-2.5-flash",
    desc: "Fast, cost-effective multimodal reasoning by Google DeepMind.",
  },
  {
    id: "OPENAI",
    name: "OpenAI",
    placeholder: "sk-...",
    defaultModel: "gpt-4o-mini",
    desc: "Industry standard models including GPT-4o and GPT-4o-mini.",
  },
  {
    id: "ANTHROPIC",
    name: "Anthropic Claude",
    placeholder: "sk-ant-...",
    defaultModel: "claude-3-5-haiku-20241022",
    desc: "State of the art structured reasoning and code parsing.",
  },
  {
    id: "CUSTOM",
    name: "Custom / Self-Hosted",
    placeholder: "api-key-...",
    defaultModel: "llama-3.3-70b-versatile",
    desc: "OpenAI-compatible endpoints (Groq, Together, Ollama, DeepSeek, vLLM).",
  },
];

interface LlmProviderSelectorProps {
  selected: ProviderType;
  onSelect: (provider: ProviderType) => void;
}

export const LlmProviderSelector: React.FC<LlmProviderSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[#94A3B8]">
        Select Provider
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PROVIDERS.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`p-3 text-left border rounded-xs transition-all ${
                isSelected
                  ? "bg-[#3178C6]/15 border-[#3178C6] text-[#F1F5F9]"
                  : "bg-[#0A0D12] border-[#202937] text-[#94A3B8] hover:border-[#3178C6]/50 hover:text-[#F1F5F9]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{p.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#5499EB]" />}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
