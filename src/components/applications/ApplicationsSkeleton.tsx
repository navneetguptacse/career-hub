"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface ApplicationsSkeletonProps {
  viewMode: "kanban" | "table";
}

export const ApplicationsSkeleton: React.FC<ApplicationsSkeletonProps> = ({
  viewMode,
}) => {
  if (viewMode === "kanban") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {[1, 2, 3, 4, 5].map((col) => (
          <div
            key={col}
            className="w-72 shrink-0 bg-[#0E131A] border border-[#202937] rounded-xs flex flex-col max-h-[calc(100vh-14rem)]"
          >
            <div className="p-3 border-b border-[#202937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-xs" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-4 w-6 rounded-xs" />
            </div>

            <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="p-3 bg-[#12171F] border border-[#202937] rounded-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-3.5 w-40" />
                  <div className="flex items-center gap-1.5 pt-1">
                    <Skeleton className="h-4 w-14 rounded-xs" />
                    <Skeleton className="h-4 w-16 rounded-xs" />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#202937]/50">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-[#202937] bg-[#12171F] rounded-xs overflow-hidden">
      <div className="p-3 border-b border-[#202937] flex items-center justify-between bg-[#0A0D12]">
        <div className="flex items-center gap-6">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-24 hidden md:block" />
          <Skeleton className="h-3.5 w-20 hidden lg:block" />
        </div>
        <Skeleton className="h-3.5 w-16" />
      </div>

      <div className="divide-y divide-[#202937]">
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div
            key={row}
            className="p-3.5 flex items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-36" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3.5 w-14 rounded-xs" />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Skeleton className="h-5 w-20 rounded-xs" />
              <Skeleton className="h-3 w-20 hidden sm:block" />
              <div className="flex items-center gap-1">
                <Skeleton className="w-7 h-7 rounded-xs" />
                <Skeleton className="w-7 h-7 rounded-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
