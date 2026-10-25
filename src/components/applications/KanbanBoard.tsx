"use client";

import React from "react";
import { Badge, ApplicationStatusType } from "@/components/ui/Badge";
import { JobCard, JobApplicationItem } from "./JobCard";

interface KanbanBoardProps {
  applications: JobApplicationItem[];
  onStatusChange: (id: string, newStatus: ApplicationStatusType) => void;
  onDelete: (id: string) => void;
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
}) => {
  const getJobsByStatus = (status: ApplicationStatusType) =>
    applications.filter((app) => app.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pb-6 overflow-x-auto">
      {COLUMNS.map((col) => {
        const columnJobs = getJobsByStatus(col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-[#0A0D12] border border-[#202937] rounded-xs p-2.5 min-w-65 h-full"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#202937]">
              <div className="flex items-center gap-2">
                <Badge status={col.id} size="sm" />
                <span className="text-xs font-semibold text-[#F1F5F9]">
                  {col.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#94A3B8] px-1.5 py-0.2 bg-[#12171F] border border-[#202937] rounded-xs">
                {columnJobs.length}
              </span>
            </div>

            <div className="flex-1 space-y-2.5 min-h-40 overflow-y-auto">
              {columnJobs.length === 0 ? (
                <div className="h-28 flex items-center justify-center border border-dashed border-[#202937] rounded-xs text-[#64748B] text-xs">
                  No applications
                </div>
              ) : (
                columnJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
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
