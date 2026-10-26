"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Globe,
  GripVertical,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { type ApplicationStatusType } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";

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

const NEXT_STATUSES: Record<
  ApplicationStatusType,
  ApplicationStatusType | null
> = {
  WISHLIST: "APPLIED",
  APPLIED: "SCREENING",
  SCREENING: "INTERVIEW",
  INTERVIEW: "OFFER",
  OFFER: null,
  REJECTED: null,
  WITHDRAWN: null,
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onStatusChange,
  onDelete,
  onEdit,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const nextStatus = NEXT_STATUSES[job.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(job);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

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
                  {job.companyName}
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

        <div className="flex items-center gap-1.5">
          {nextStatus && (
            <button
              onClick={() => onStatusChange(job.id, nextStatus)}
              title={`Advance to ${nextStatus}`}
              className="h-6 px-2 inline-flex items-center gap-0.5 text-[10px] font-mono text-[#5499EB] hover:text-white bg-[#3178C6]/15 hover:bg-[#3178C6] border border-[#3178C6]/30 rounded-xs transition-colors"
            >
              <span>{nextStatus}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              title="Edit application"
              className="h-6 w-6 inline-flex items-center justify-center text-[#64748B] hover:text-[#5499EB] hover:bg-[#18202C] rounded-xs transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Delete application"
            className="h-6 w-6 inline-flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-[#18202C] rounded-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
