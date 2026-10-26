"use client";

import React from "react";
import { Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface JobActivityTimelineProps {
  activities?: ActivityItem[];
}

export const JobActivityTimeline: React.FC<JobActivityTimelineProps> = ({
  activities,
}) => {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
      <div className="flex items-center gap-2 border-b border-[#202937] pb-2">
        <Activity className="w-4 h-4 text-[#3178C6]" />
        <h3 className="text-xs font-semibold font-mono text-[#F1F5F9] uppercase tracking-wide">
          Activity History
        </h3>
      </div>
      <div className="space-y-2">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-start justify-between text-xs gap-3 p-2 bg-[#12171F] border border-[#202937] rounded-xs"
          >
            <div>
              <div className="font-semibold text-[#F1F5F9]">{act.title}</div>
              {act.description && (
                <div className="text-[11px] text-[#94A3B8] mt-0.5">
                  {act.description}
                </div>
              )}
            </div>
            <div className="text-[10px] text-[#64748B] font-mono shrink-0">
              {formatDate(act.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
