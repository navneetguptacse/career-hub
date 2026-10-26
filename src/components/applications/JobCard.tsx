"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Globe,
  GripVertical,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { type ApplicationStatusType } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";
import { capitalizeCompanyName } from "@/lib/scraper";

export interface JobApplicationItem {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string | null;
  locationType: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  jobUrl?: string | null;
  jobDescription?: string | null;
  status: ApplicationStatusType;
  source: string;
  appliedDate?: string | null;
  createdAt: string;
  notes?: string | null;
}

interface JobCardProps {
  job: JobApplicationItem;
  onStatusChange: (id: string, newStatus: ApplicationStatusType) => void;
  onDelete: (job: JobApplicationItem) => void;
  onEdit?: (job: JobApplicationItem) => void;
}

const ALL_STATUS_OPTIONS: ApplicationStatusType[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

const STATUS_LABELS: Record<ApplicationStatusType, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onStatusChange,
  onDelete,
  onEdit,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const formattedCompanyName = capitalizeCompanyName(job.companyName);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative p-3 bg-[#12171F] border border-[#202937] hover:border-[#3178C6]/60 rounded-xs transition-all shadow-xs space-y-2.5 cursor-grab active:cursor-grabbing select-none",
        isDragging && "opacity-40 border-dashed border-[#3178C6] scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <GripVertical className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#94A3B8] shrink-0 mt-0.5 cursor-grab" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F1F5F9] group-hover:text-[#5499EB] transition-colors">
                <span className="truncate max-w-42.5 font-medium">
                  {formattedCompanyName}
                </span>
              </div>
              <h4 className="text-xs text-[#334155] dark:text-[#E2E8F0] job-title-heading mt-0.5 leading-snug line-clamp-2 font-medium">
                {job.jobTitle}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#94A3B8]">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#64748B]" />
                  <span className="truncate max-w-32.5">{job.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in browser"
            className="text-[#94A3B8] hover:text-[#3178C6] hover:bg-[#18202C] p-1 rounded-xs transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {job.notes && (
        <p className="text-[11px] text-[#94A3B8] line-clamp-2 bg-[#0A0D12] p-1.5 rounded-xs border border-[#202937]/60">
          {job.notes}
        </p>
      )}

      <div className="pt-2 border-t border-[#202937] flex items-center justify-between">
        <div className="text-[10px] text-[#64748B] font-medium">
          {formatDate(job.appliedDate || job.createdAt)}
        </div>

        {/* 3-Dot Options Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
              setShowStatusMenu(false);
            }}
            title="Options"
            className="h-6 w-6 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] rounded-xs border border-transparent hover:border-[#202937] transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 bottom-full mb-1 w-44 bg-[#12171F] border border-[#202937] rounded-xs shadow-xl z-30 py-1"
            >
              {!showStatusMenu ? (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(job);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#F1F5F9] hover:bg-[#18202C] hover:text-[#5499EB] transition-colors"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowStatusMenu(true)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#F1F5F9] hover:bg-[#18202C] hover:text-[#5499EB] transition-colors flex items-center justify-between"
                  >
                    <span>Status Change</span>
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  </button>

                  <div className="my-1 border-t border-[#202937]" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(job);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <div className="px-2.5 py-1 border-b border-[#202937] flex items-center justify-between mb-0.5">
                    <button
                      type="button"
                      onClick={() => setShowStatusMenu(false)}
                      className="text-[11px] text-[#64748B] hover:text-[#F1F5F9] transition-colors font-mono"
                    >
                      &larr; Back
                    </button>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">
                      Status
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {ALL_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          onStatusChange(job.id, status);
                          setIsMenuOpen(false);
                          setShowStatusMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs transition-colors",
                          job.status === status
                            ? "bg-[#3178C6]/15 text-[#5499EB] font-medium"
                            : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C]"
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
