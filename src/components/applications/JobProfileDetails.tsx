"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  MapPin,
  Send,
  Trash2,
  Layers,
  FileText,
} from "lucide-react";
import { Badge, type ApplicationStatusType } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { JobApplicationItem } from "./JobCard";
import { JobNotesSection } from "./JobNotesSection";
import { JobActivityTimeline, type ActivityItem } from "./JobActivityTimeline";

interface FullJobApplication extends JobApplicationItem {
  deadline?: string | null;
  activities?: ActivityItem[];
}

interface JobProfileDetailsProps {
  applicationId: string;
  initialData?: JobApplicationItem;
  onStatusChange?: (id: string, newStatus: ApplicationStatusType) => void;
  onDelete?: (id: string) => void;
  onUpdated?: (updated: JobApplicationItem) => void;
}

const ALL_STATUSES: ApplicationStatusType[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

export const JobProfileDetails: React.FC<JobProfileDetailsProps> = ({
  applicationId,
  initialData,
  onStatusChange,
  onDelete,
  onUpdated,
}) => {
  const [job, setJob] = useState<FullJobApplication | null>(
    initialData || null
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isCopiedDesc, setIsCopiedDesc] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function fetchFullJob() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setJob(data.application);
        }
      } catch (err) {
        console.error("Failed to fetch full application:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    fetchFullJob();
    return () => {
      isCancelled = true;
    };
  }, [applicationId]);

  const handleStatusSelect = async (newStatus: ApplicationStatusType) => {
    if (!job || job.status === newStatus) return;
    setJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    onStatusChange?.(job.id, newStatus);

    try {
      const res = await fetch(`/api/applications/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setJob((prev) => (prev ? { ...prev, ...data.application } : null));
        if (data.application) onUpdated?.(data.application);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveNotes = async (newNotes: string) => {
    if (!job) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/applications/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: newNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        setJob((prev) => (prev ? { ...prev, notes: newNotes } : null));
        if (data.application) onUpdated?.(data.application);
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCopyDescription = () => {
    if (!job?.jobDescription) return;
    navigator.clipboard.writeText(job.jobDescription);
    setIsCopiedDesc(true);
    setTimeout(() => setIsCopiedDesc(false), 2000);
  };

  if (isLoading || !job) {
    return (
      <div className="py-12 text-center text-xs text-[#94A3B8]">
        Loading job profile details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with Company, Title, and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#202937] pb-5">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#5499EB] flex items-center gap-1.5 uppercase tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              {job.companyName}
            </span>
            <span className="text-[#64748B]">•</span>
            <Badge status={job.status} size="sm" />
            {job.source === "TELEGRAM" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs">
                <Send className="w-2.5 h-2.5" />
                Telegram Ingestion
              </span>
            )}
          </div>
          <h1 className="text-lg md:text-xl font-bold text-[#F1F5F9] leading-snug">
            {job.jobTitle}
          </h1>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-[#3178C6] hover:bg-[#235A97] rounded-xs transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Visit Posting</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(job.id)}
              className="text-[#EF4444] hover:bg-[#EF4444]/15 border-[#202937]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Structured Key Information Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
          <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#64748B]" />
            Location
          </div>
          <div className="text-xs font-semibold text-[#F1F5F9] truncate">
            {job.location || "Unspecified"}
          </div>
        </div>

        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
          <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#64748B]" />
            Workplace
          </div>
          <div className="text-xs font-semibold text-[#F1F5F9]">
            {job.locationType}
          </div>
        </div>

        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
          <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#64748B]" />
            Applied Date
          </div>
          <div className="text-xs font-semibold text-[#F1F5F9] font-mono">
            {formatDate(job.appliedDate || job.createdAt)}
          </div>
        </div>

        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
          <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#64748B]" />
            Pipeline Stage
          </div>
          <select
            value={job.status}
            onChange={(e) =>
              handleStatusSelect(e.target.value as ApplicationStatusType)
            }
            className="w-full bg-[#12171F] border border-[#202937] text-xs text-[#F1F5F9] rounded-xs py-0.5 px-1.5 font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3178C6]"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Full Job Description Section */}
      <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#202937] pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#3178C6]" />
            <h3 className="text-xs font-semibold font-mono text-[#F1F5F9] uppercase tracking-wide">
              Job Description &amp; Role Details
            </h3>
          </div>
          {job.jobDescription && (
            <button
              type="button"
              onClick={handleCopyDescription}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              {isCopiedDesc ? (
                <Check className="w-3 h-3 text-[#10B981]" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{isCopiedDesc ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>

        {job.jobDescription ? (
          <div className="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto pr-2 font-sans select-text">
            {job.jobDescription}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] italic">
            No detailed description available. Job was logged with title and
            company metadata.
          </p>
        )}
      </div>

      {/* Personal Notes Section */}
      <JobNotesSection
        initialNotes={job.notes}
        onSave={handleSaveNotes}
        isSaving={isSavingNotes}
      />

      {/* Activity Timeline Audit Trail */}
      <JobActivityTimeline activities={job.activities} />
    </div>
  );
};
