"use client";

import React from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { type ApplicationStatusType } from "@/components/ui/Badge";
import { JobApplicationItem } from "./JobCard";
import { formatCurrency, formatDate } from "@/lib/utils";

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

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onStatusChange,
  onDelete,
}) => {
  if (applications.length === 0) {
    return (
      <div className="p-12 text-center border border-[#202937] bg-[#12171F] rounded-xs text-[#94A3B8] text-sm">
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
            <th className="px-4 py-3">Salary Range</th>
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
                <div className="font-semibold text-sm text-[#F1F5F9]">
                  {app.companyName}
                </div>
                <div className="text-xs text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                  <span>{app.jobTitle}</span>
                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3178C6] hover:text-[#5499EB]"
                    >
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  )}
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
                  className="h-8 bg-[#0A0D12] border border-[#202937] rounded-xs px-2 text-xs text-[#F1F5F9] font-mono focus:outline-none focus:border-[#3178C6]"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>

              <td className="px-4 py-3.5">
                <span className="px-1.5 py-0.5 bg-[#0A0D12] border border-[#202937] rounded-xs text-[11px] text-[#94A3B8]">
                  {app.locationType}
                </span>
                {app.location && (
                  <div className="text-[11px] text-[#64748B] mt-0.5 truncate max-w-30">
                    {app.location}
                  </div>
                )}
              </td>

              <td className="px-4 py-3.5 font-mono text-[#10B981]">
                {app.salaryMin || app.salaryMax ? (
                  <span>
                    {app.salaryMin
                      ? formatCurrency(app.salaryMin, app.currency)
                      : "0"}
                    {" - "}
                    {app.salaryMax
                      ? formatCurrency(app.salaryMax, app.currency)
                      : "..."}
                  </span>
                ) : (
                  <span className="text-[#64748B]">N/A</span>
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
                <button
                  onClick={() => onDelete(app.id)}
                  title="Delete application"
                  className="h-8 w-8 inline-flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-[#18202C] rounded-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
