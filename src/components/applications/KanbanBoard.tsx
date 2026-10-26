"use client";

import React from "react";
import { Badge, ApplicationStatusType } from "@/components/ui/Badge";
import { JobCard, JobApplicationItem } from "./JobCard";

interface KanbanBoardProps {
  applications: JobApplicationItem[];
  onStatusChange: (id: string, newStatus: ApplicationStatusType) => void;
  onDelete: (id: string) => void;
  onSelect?: (job: JobApplicationItem) => void;
}

const COLUMNS: { id: ApplicationStatusType; title: string }[] = [
  { id: "WISHLIST", title: "Wishlist" },
  { id: "APPLIED", title: "Applied" },
  { id: "SCREENING", title: "Screening" },
  { id: "INTERVIEW", title: "Interview" },
  { id: "OFFER", title: "Offer" },
  { id: "REJECTED", title: "Rejected" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onStatusChange,
  onDelete,
  onSelect,
}) => {
  const [dragOverColId, setDragOverColId] =
    React.useState<ApplicationStatusType | null>(null);

  const getJobsByStatus = (status: ApplicationStatusType) =>
    applications.filter((app) => app.status === status);

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    status: ApplicationStatusType
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== status) {
      setDragOverColId(status);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    status: ApplicationStatusType
  ) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColId === status) {
        setDragOverColId(null);
      }
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    status: ApplicationStatusType
  ) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("text/plain");
    if (jobId) {
      onStatusChange(jobId, status);
    }
    setDragOverColId(null);
  };

  return (
    <div className="flex gap-3.5 pb-6 overflow-x-auto min-h-[calc(100vh-13rem)] w-full items-start">
      {COLUMNS.map((col) => {
        const columnJobs = getJobsByStatus(col.id);
        const isTarget = dragOverColId === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col bg-[#12171F] border rounded-xs w-72 min-w-67.5 max-w-[320px] flex-1 shrink-0 self-stretch shadow-xs transition-colors ${
              isTarget
                ? "border-[#3178C6] ring-1 ring-[#3178C6]"
                : "border-[#202937]"
            }`}
          >
            {/* Column Header - strictly aligned horizontal row */}
            <div className="flex items-center justify-between p-3 border-b border-[#202937] bg-[#12171F]">
              <div className="flex items-center gap-2 min-w-0">
                <Badge status={col.id} size="sm" />
                <span className="text-xs font-semibold text-[#F1F5F9] truncate tracking-tight">
                  {col.title}
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#94A3B8] px-1.5 py-0.5 bg-[#0A0D12] border border-[#202937] rounded-xs shrink-0">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Cards Dropzone */}
            <div
              className={`flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-60 transition-colors ${
                isTarget ? "bg-[#3178C6]/10" : "bg-[#3178C6]/3"
              }`}
            >
              {columnJobs.length === 0 ? (
                <div
                  className={`h-32 flex flex-col items-center justify-center border border-dashed rounded-xs text-xs font-medium select-none transition-colors ${
                    isTarget
                      ? "border-[#3178C6] bg-[#3178C6]/15 text-[#5499EB]"
                      : "border-[#3178C6]/25 bg-[#3178C6]/5 text-[#3178C6]"
                  }`}
                >
                  <span>
                    {isTarget ? "Drop to move here" : "No applications"}
                  </span>
                </div>
              ) : (
                columnJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
