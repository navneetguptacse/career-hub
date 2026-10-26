"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { type ApplicationStatusType } from "@/components/ui/Badge";
import { JobProfileDetails } from "./JobProfileDetails";
import type { JobApplicationItem } from "./JobCard";

interface JobProfileModalProps {
  job: JobApplicationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: ApplicationStatusType) => void;
  onDelete?: (id: string) => void;
  onUpdated?: (updated: JobApplicationItem) => void;
}

export const JobProfileModal: React.FC<JobProfileModalProps> = ({
  job,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  onUpdated,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs select-none">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-3xl bg-[#12171F] border border-[#202937] rounded-xs shadow-2xl p-5 sm:p-6 text-[#F1F5F9] max-h-[92vh] overflow-y-auto"
      >
        {/* Top Control Bar with Full Page Link & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-[#202937] mb-4">
          <Link
            href={`/applications/${job.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#5499EB] hover:text-[#3178C6] font-mono transition-colors"
          >
            <span>Open as Dedicated Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded-xs transition-colors"
            title="Close Job Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Job Profile View */}
        <JobProfileDetails
          applicationId={job.id}
          initialData={job}
          onStatusChange={onStatusChange}
          onDelete={(id) => {
            onDelete?.(id);
            onClose();
          }}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  );
};
