"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Trash2,
  Lock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  LlmProviderSelector,
  PROVIDERS,
  type ProviderType,
} from "./LlmProviderSelector";
import { LlmModelInputs } from "./LlmModelInputs";

interface LlmData {
  provider: ProviderType;
  hasKey: boolean;
  keyHint: string;
  endpoint: string;
  model: string;
}

export const LlmConfigCard: React.FC = () => {
  const [provider, setProvider] = useState<ProviderType>("GEMINI");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [keyHint, setKeyHint] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/user/llm");
        if (res.ok) {
          const data: LlmData = await res.json();
          setProvider(data.provider || "GEMINI");
          setHasStoredKey(data.hasKey);
          setKeyHint(data.keyHint || "");
          setEndpoint(data.endpoint || "");
          setModel(data.model || "");
        }
      } catch (err) {
        console.error("Failed to load LLM config:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/user/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim() || undefined,
          endpoint: endpoint.trim() || undefined,
          model: model.trim() || undefined,
          testOnly: true,
        }),
      });
      const data = await res.json();
      setFeedback({
        type: data.success ? "success" : "error",
        message:
          data.message ||
          (data.success ? "Connection tested!" : "Verification failed."),
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Network error while testing provider connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/user/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim() || undefined,
          endpoint: endpoint.trim() || undefined,
          model: model.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to save configuration");

      setHasStoredKey(data.hasKey);
      setKeyHint(data.keyHint || "");
      setApiKey("");
      setFeedback({
        type: "success",
        message: "API key encrypted & securely stored in database.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error saving LLM settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to system defaults? Custom API key will be deleted.")) {
      return;
    }
    setIsResetting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/user/llm", { method: "DELETE" });
      if (res.ok) {
        setProvider("GEMINI");
        setApiKey("");
        setEndpoint("");
        setModel("");
        setHasStoredKey(false);
        setKeyHint("");
        setFeedback({
          type: "success",
          message: "Reset to default system LLM pipeline.",
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to reset settings." });
    } finally {
      setIsResetting(false);
    }
  };

  const currentProviderMeta =
    PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202937] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              Provider Configuration
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Configure your own Gemini, OpenAI, Anthropic, or custom inference
              key for job parsing.
            </p>
          </div>
        </div>

        {hasStoredKey && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xs text-[#10B981] text-[11px] font-mono shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>Active: {keyHint}</span>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs border rounded-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
              : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-xs text-[#94A3B8]">
          Loading LLM settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <LlmProviderSelector selected={provider} onSelect={setProvider} />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#3178C6]" />
                API Key {hasStoredKey ? "(Leave blank to keep existing)" : "*"}
              </label>
              {hasStoredKey && (
                <span className="text-[10px] text-[#64748B] font-mono">
                  Currently Stored: {keyHint}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  hasStoredKey
                    ? "Enter new key to replace existing encrypted key..."
                    : currentProviderMeta.placeholder
                }
                className="w-full h-9 pl-3 pr-10 text-xs bg-[#0A0D12] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <LlmModelInputs
            provider={provider}
            endpoint={endpoint}
            setEndpoint={setEndpoint}
            model={model}
            setModel={setModel}
            meta={currentProviderMeta}
          />

          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#3178C6] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              <strong className="text-[#F1F5F9]">Security Architecture:</strong>{" "}
              All API keys are cryptographically hashed and encrypted using
              AES-256-GCM before database storage. Plaintext keys are never
              stored, logged, or returned over the wire.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                disabled={isSaving || isTesting}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                isLoading={isTesting}
                disabled={isSaving || isTesting || (!apiKey && !hasStoredKey)}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </Button>
            </div>

            {hasStoredKey && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleReset}
                isLoading={isResetting}
                disabled={isSaving || isTesting || isResetting}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
