"use client";

import React, { useState } from "react";
import { Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface JobNotesSectionProps {
  initialNotes?: string | null;
  onSave: (notes: string) => Promise<void>;
  isSaving: boolean;
}

export const JobNotesSection: React.FC<JobNotesSectionProps> = ({
  initialNotes,
  onSave,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialNotes || "");

  const handleSave = async () => {
    await onSave(draft);
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#202937] pb-2">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#3178C6]" />
          <h3 className="text-xs font-semibold font-mono text-[#F1F5F9] uppercase tracking-wide">
            Personal Notes &amp; Preparation
          </h3>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setDraft(initialNotes || "");
              setIsEditing(true);
            }}
            className="text-[11px] font-mono text-[#5499EB] hover:underline"
          >
            Edit Notes
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add interview stages, referral contacts, or follow-up notes..."
            className="w-full p-2.5 text-xs bg-[#12171F] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#3178C6]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(initialNotes || "");
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Notes"}</span>
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
          {initialNotes ||
            "No notes logged yet. Click 'Edit Notes' to record details."}
        </p>
      )}
    </div>
  );
};
