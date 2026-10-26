export type ProviderType = "GEMINI" | "OPENAI" | "ANTHROPIC" | "CUSTOM";

export interface ProviderOption {
  id: ProviderType;
  name: string;
  defaultModel: string;
  models: string[];
  placeholderKey: string;
}

export const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: "GEMINI",
    name: "Google Gemini",
    defaultModel: "gemini-flash-lite-latest",
    models: ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.5-pro"],
    placeholderKey: "AQ.Ab8...",
  },
  {
    id: "OPENAI",
    name: "OpenAI",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o", "o3-mini"],
    placeholderKey: "sk-proj-...",
  },
  {
    id: "ANTHROPIC",
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-haiku-20241022",
    models: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
    placeholderKey: "sk-ant-...",
  },
  {
    id: "CUSTOM",
    name: "Custom (Groq / Ollama / DeepSeek)",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "deepseek-chat",
      "mistral-small-latest",
    ],
    placeholderKey: "gsk_... or custom key",
  },
];
