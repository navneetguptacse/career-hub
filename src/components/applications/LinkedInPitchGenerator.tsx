"use client";

import React, { useState } from "react";
import { Check, Clipboard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AutoTextarea } from "@/components/ui/AutoTextarea";
import { PITCH_TONES, type PitchTone } from "@/lib/validations";
import { syncPitchGreeting } from "@/lib/pitch";

interface LinkedInPitchGeneratorProps {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  jobUrl?: string;
  notes?: string;
  onAppendToNotes?: (entry: string) => void;
}

const TONE_TIPS: Record<PitchTone, string> = {
  Formal: "Polished & professional",
  Friendly: "Warm & conversational",
  Confident: "Direct & impact-driven",
  Concise: "Under 280 chars (connection note)",
  Referral: "Polite referral or insight ask",
};

export const LinkedInPitchGenerator: React.FC<LinkedInPitchGeneratorProps> = ({
  companyName,
  jobTitle,
  jobDescription,
  jobUrl,
  notes,
  onAppendToNotes,
}) => {
  const [recipientName, setRecipientName] = useState("");
  const [tone, setTone] = useState<PitchTone>("Formal");
  const [pitch, setPitch] = useState("");
  const [activeMode, setActiveMode] = useState<"generate" | "refine" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedToNotes, setIsSavedToNotes] = useState(false);
  const [showToneHelp, setShowToneHelp] = useState(false);

  const handleRecipientChange = (nextName: string) => {
    setRecipientName(nextName);
    setPitch((prev) => syncPitchGreeting(prev, nextName));
  };

  const handlePitchRequest = async (mode: "generate" | "refine") => {
    setError(null);

    if (mode === "generate" && (!companyName.trim() || !jobTitle.trim())) {
      setError("Enter Company and Role above before generating a pitch.");
      return;
    }

    if (mode === "refine" && !pitch.trim()) {
      setError("Enter or paste your draft pitch below to refine it with AI.");
      return;
    }

    setActiveMode(mode);
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          recipientName: recipientName.trim(),
          tone,
          draftPitch: pitch,
          jobDescription: jobDescription || null,
          jobUrl: jobUrl || null,
          notes: notes || null,
        }),
      });

      const data = (await res.json()) as { pitch?: string; error?: string };
      if (!res.ok || !data.pitch) {
        throw new Error(data.error || "Failed to process LinkedIn pitch");
      }

      setPitch(data.pitch);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process LinkedIn pitch"
      );
    } finally {
      setActiveMode(null);
    }
  };

  const handleCopy = async () => {
    if (!pitch.trim()) return;
    await navigator.clipboard.writeText(pitch);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!pitch.trim() || !onAppendToNotes) return;
    const recipientHeader = recipientName.trim()
      ? `LinkedIn Pitch (${recipientName.trim()} · ${tone}):`
      : `LinkedIn Pitch (${tone}):`;
    onAppendToNotes(`${recipientHeader}\n${pitch.trim()}`);
    setIsSavedToNotes(true);
    setTimeout(() => setIsSavedToNotes(false), 2000);
  };

  const trimmedRecipient = recipientName.trim();

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[#94A3B8]">
          LinkedIn Pitch
        </label>
        {trimmedRecipient && (
          <span className="text-[11px] font-mono text-[#5499EB] bg-[#3178C6]/10 border border-[#3178C6]/30 px-1.5 py-0.5 rounded-xs truncate max-w-56">
            To: {trimmedRecipient}
          </span>
        )}
      </div>

      <div className="relative flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center h-9 bg-[#0A0D12] border border-[#202937] focus-within:border-[#3178C6] rounded-xs pr-1.5 min-w-0">
          <input
            type="text"
            value={recipientName}
            onChange={(e) => handleRecipientChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handlePitchRequest("generate");
              }
            }}
            placeholder="Enter name..."
            aria-label="Recipient name (recruiter, hiring manager, or HR)"
            className="flex-1 min-w-0 h-full px-3 text-xs bg-transparent text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none"
          />

          <div className="flex items-center gap-1 shrink-0">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as PitchTone)}
              aria-label="Pitch tone"
              className="h-6.5 pl-2 text-[11px] bg-[#12171F] text-[#F1F5F9] border border-[#202937] rounded-xs focus:outline-none focus:border-[#3178C6]"
            >
              {PITCH_TONES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowToneHelp((prev) => !prev)}
              onMouseEnter={() => setShowToneHelp(true)}
              onMouseLeave={() => setShowToneHelp(false)}
              onBlur={() => setShowToneHelp(false)}
              title="Pitch tone & AI guide"
              aria-label="Pitch tone and AI guide"
              aria-expanded={showToneHelp}
              className="h-6.5 w-6.5 inline-flex items-center justify-center bg-[#12171F] border border-[#202937] hover:border-[#3178C6] text-[#64748B] hover:text-[#5499EB] rounded-xs transition-colors cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => handlePitchRequest("generate")}
          isLoading={activeMode === "generate"}
          disabled={Boolean(activeMode)}
          className="h-9 px-3.5 shrink-0 cursor-pointer"
        >
          Pitch
        </Button>

        {showToneHelp && (
          <div
            role="tooltip"
            className="absolute right-0 bottom-full mb-2 w-72 p-2.5 bg-[#12171F] border border-[#202937] rounded-xs shadow-xl text-[11px] text-[#94A3B8] space-y-1.5 z-20"
          >
            <div className="font-semibold text-[#F1F5F9]">
              Tone: {tone} — {TONE_TIPS[tone]}
            </div>
            <p className="leading-relaxed">
              Enter a recruiter, hiring manager, or HR name and click{" "}
              <span className="text-[#F1F5F9] font-medium">Pitch</span> to
              generate, or write your own draft below and click{" "}
              <span className="text-[#F1F5F9] font-medium">Refine</span>.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 text-[11px] text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
          {error}
        </div>
      )}

      <AutoTextarea
        rows={3}
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
        placeholder="Generated LinkedIn pitch appears here — or paste your own draft to refine with AI..."
        className="w-full p-2.5 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] leading-relaxed"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="inline-flex items-center h-7 px-2.5 font-mono text-[#94A3B8] bg-[#18202C] border border-[#202937] rounded-xs">
          {pitch.length} chars
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePitchRequest("refine")}
            isLoading={activeMode === "refine"}
            disabled={Boolean(activeMode) || !pitch.trim()}
            className="h-7 px-2.5 text-[11px] gap-1"
          >
            <span>Refine with AI</span>
          </Button>

          {onAppendToNotes && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSaveToNotes}
              disabled={!pitch.trim()}
              className={
                isSavedToNotes
                  ? "h-7 px-2.5 text-[11px] bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#34D399] hover:text-[#34D399] border border-[#10B981]/30"
                  : "h-7 px-2.5 text-[11px] bg-[#3178C6]/15 hover:bg-[#3178C6]/25 text-[#5499EB] hover:text-[#5499EB] border border-[#3178C6]/30"
              }
            >
              {isSavedToNotes ? "Added to Notes" : "Add to Notes"}
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!pitch.trim()}
            className="h-7 px-2.5 text-[11px] gap-1"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-[#10B981]" />
            ) : (
              <Clipboard className="w-3 h-3" />
            )}
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
