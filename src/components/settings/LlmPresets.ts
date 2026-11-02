export type ProviderType =
  "GEMINI" | "OPENAI" | "ANTHROPIC" | "DEEPSEEK" | "CUSTOM";

export interface ProviderOption {
  id: ProviderType;
  name: string;
  defaultModel: string;
  models: string[];
  placeholderKey: string;
  defaultEndpoint?: string;
}

export const PRESET_PROVIDERS: ProviderOption[] = [
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
    id: "DEEPSEEK",
    name: "DeepSeek",
    defaultModel: "deepseek-v4-flash",
    models: ["deepseek-v4-flash", "deepseek-chat", "deepseek-reasoner"],
    placeholderKey: "sk-...",
    defaultEndpoint: "https://api.deepseek.com",
  },
];

export const CUSTOM_PROVIDER_OPTION: ProviderOption = {
  id: "CUSTOM",
  name: "Custom Provider",
  defaultModel: "llama-3.3-70b-versatile",
  models: ["llama-3.3-70b-versatile", "mistral-small-latest", "qwen-2.5-72b"],
  placeholderKey: "gsk_... or custom API key",
  defaultEndpoint: "https://api.groq.com/openai/v1",
};

export const PROVIDER_OPTIONS: ProviderOption[] = [
  ...PRESET_PROVIDERS,
  CUSTOM_PROVIDER_OPTION,
];
