"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PROVIDER_OPTIONS, type ProviderType } from "./LlmPresets";
import { LlmProviderGrid } from "./LlmProviderGrid";

export const LlmConfigCard: React.FC = () => {
  const [provider, setProvider] = useState<ProviderType>("GEMINI");
  const [apiKey, setApiKey] = useState("");
  const [keyHint, setKeyHint] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [model, setModel] = useState("gemini-flash-lite-latest");
  const [endpoint, setEndpoint] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/user/llm");
        if (res.ok) {
          const data = await res.json();
          if (data.provider) setProvider(data.provider);
          if (data.model) setModel(data.model);
          if (data.endpoint) setEndpoint(data.endpoint);
          if (data.hasKey) setHasKey(true);
          if (data.keyHint) setKeyHint(data.keyHint);
        }
      } catch (err) {
        console.warn("Failed to load user LLM config:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleProviderSelect = (newProvider: ProviderType) => {
    setProvider(newProvider);
    setStatusMessage(null);
    const meta = PROVIDER_OPTIONS.find((p) => p.id === newProvider);
    if (meta) {
      setModel(meta.defaultModel);
      if (newProvider === "CUSTOM" && !endpoint) {
        setEndpoint("https://api.groq.com/openai/v1");
      }
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/user/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim() || undefined,
          model: model.trim() || undefined,
          endpoint: endpoint.trim() || undefined,
          testOnly: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Connection test succeeded!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.message || data.error || "Connection test failed.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error testing provider connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim() || undefined,
          model: model.trim() || undefined,
          endpoint: endpoint.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to save configuration");

      if (data.hasKey) setHasKey(true);
      if (data.keyHint) setKeyHint(data.keyHint);
      setApiKey("");

      setStatusMessage({
        type: "success",
        text: "AI Provider configuration saved securely.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset to default system provider (Gemini)?")) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/llm", { method: "DELETE" });
      if (res.ok) {
        setProvider("GEMINI");
        setModel("gemini-flash-lite-latest");
        setApiKey("");
        setKeyHint("");
        setHasKey(false);
        setEndpoint("");
        setStatusMessage({
          type: "info",
          text: "Reset to default system Gemini provider.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const currentOption = PROVIDER_OPTIONS.find((p) => p.id === provider);

  if (isLoading) {
    return (
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs animate-pulse text-xs text-[#94A3B8]">
        Loading AI provider settings...
      </div>
    );
  }

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#202937] pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9]">
              AI Extraction Provider
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Select and configure your own LLM provider for metadata scraping
              and job posting parsing.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selector Grid */}
      <LlmProviderGrid
        selectedProvider={provider}
        onSelectProvider={handleProviderSelect}
      />

      <form onSubmit={handleSave} className="space-y-4">
        {/* API Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
              <span>API Key</span>
            </label>
            {hasKey && (
              <span className="text-[11px] font-mono text-[#10B981]">
                Saved: {keyHint}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasKey
                  ? "Leave blank to keep saved key, or enter new key..."
                  : currentOption?.placeholderKey || "Enter your API key..."
              }
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9]"
            >
              {showKey ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Keys are encrypted using AES-256-GCM before database storage.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
            <span>Language Model</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gemini-flash-lite-latest"
              className="flex-1"
            />
          </div>
          {currentOption?.models && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-[#64748B] mt-0.5">Presets:</span>
              {currentOption.models.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`text-xs px-1.5 py-0.5 rounded-xs border transition-colors ${
                    model === m
                      ? "bg-[#3178C6]/20 border-[#3178C6] text-[#5499EB]"
                      : "bg-[#0A0D12] border-[#202937] text-[#94A3B8] hover:text-[#F1F5F9]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Endpoint */}
        {provider === "CUSTOM" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
              <span>Base URL</span>
            </label>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.groq.com/openai/v1"
            />
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 text-xs border rounded-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30"
                : statusMessage.type === "error"
                  ? "bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30"
                  : "bg-[#3178C6]/15 text-[#5499EB] border-[#3178C6]/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#202937]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={isSaving || isTesting}
            title="Reset to system defaults"
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting || isSaving}
          >
            {isTesting ? "Testing Connection..." : "Test Connection"}
          </Button>
          <Button type="submit" size="sm" disabled={isSaving || isTesting}>
            {isSaving ? "Saving..." : "Save Provider"}
          </Button>
        </div>
      </form>
    </div>
  );
};
