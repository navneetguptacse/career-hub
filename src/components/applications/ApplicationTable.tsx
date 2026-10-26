"use client";

import React from "react";
import { type ApplicationStatusType, Badge } from "@/components/ui/Badge";
import { JobApplicationItem } from "./JobCard";
import { formatDate, cn } from "@/lib/utils";
import { Globe, Trash2 } from "lucide-react";

interface ApplicationTableProps {
  applications: JobApplicationItem[];
  onStatusChange: (id: string, newStatus: ApplicationStatusType) => void;
  onDelete: (id: string) => void;
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

const statusColorStyles: Record<ApplicationStatusType, string> = {
  WISHLIST:
    "bg-[#64748B]/15 text-[#475569] dark:text-[#94A3B8] border-[#64748B]/30",
  APPLIED: "bg-[#3178C6]/15 text-[#5499EB] border-[#3178C6]/40",
  SCREENING: "bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/40",
  INTERVIEW:
    "bg-[#EAB308]/15 text-[#FACC15] dark:text-[#FACC15] border-[#EAB308]/40",
  OFFER:
    "bg-[#10B981]/15 text-[#10B981] dark:text-[#34D399] border-[#10B981]/40",
  REJECTED:
    "bg-[#EF4444]/15 text-[#EF4444] dark:text-[#F87171] border-[#EF4444]/40",
  WITHDRAWN:
    "bg-[#64748B]/15 text-[#475569] dark:text-[#94A3B8] border-[#64748B]/30",
};

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onStatusChange,
  onDelete,
}) => {
  if (applications.length === 0) {
    return (
      <div className="p-12 text-center border border-[#202937] bg-[#12171F] rounded-xs text-[#94A3B8] text-xs">
        No job applications found matching your criteria.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[#202937] rounded-xs bg-[#12171F]">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0A0D12] text-[#94A3B8] uppercase font-mono tracking-wider border-b border-[#202937]">
          <tr>
            <th className="px-4 py-3">Company & Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Workplace</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#202937]">
          {applications.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-[#18202C] transition-colors text-[#F1F5F9]"
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#F1F5F9]">
                    {app.companyName}
                  </span>
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  {app.jobTitle}
                </div>
              </td>

              <td className="px-4 py-3.5">
                <select
                  value={app.status}
                  onChange={(e) =>
                    onStatusChange(
                      app.id,
                      e.target.value as ApplicationStatusType
                    )
                  }
                  className={cn(
                    "h-7 border rounded-xs pl-2 pr-7 text-[11px] font-mono font-medium uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#3178C6] cursor-pointer transition-colors",
                    statusColorStyles[app.status] ||
                      "bg-[#18202C] text-[#94A3B8] border-[#202937]"
                  )}
                >
                  {ALL_STATUSES.map((st) => (
                    <option
                      key={st}
                      value={st}
                      className="bg-[#12171F] text-[#F1F5F9]"
                    >
                      {st}
                    </option>
                  ))}
                </select>
              </td>

              <td className="px-4 py-3.5">
                <Badge status={app.locationType} size="sm" />
                {app.location && (
                  <div className="text-[11px] text-[#64748B] mt-0.5 truncate max-w-30">
                    {app.location}
                  </div>
                )}
              </td>

              <td className="px-4 py-3.5">
                <span className="font-mono text-[10px] text-[#94A3B8] px-1.5 py-0.5 bg-[#0A0D12] border border-[#202937] rounded-xs">
                  {app.source}
                </span>
              </td>

              <td className="px-4 py-3.5 font-mono text-[#64748B]">
                {formatDate(app.appliedDate || app.createdAt)}
              </td>

              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in browser"
                      className="h-8 w-8 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#3178C6] hover:bg-[#18202C] rounded-xs transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onDelete(app.id)}
                    title="Delete application"
                    className="h-8 w-8 inline-flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-[#18202C] rounded-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
