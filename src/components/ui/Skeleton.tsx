"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("shimmer rounded-xs shrink-0 select-none", className)}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-[#202937] pb-4">
        <Skeleton className="w-10 h-10 rounded-xs" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};

export const MetricSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-4 h-4 rounded-xs" />
      </div>
      <Skeleton className="h-7 w-14 mt-1" />
      <Skeleton className="h-2.5 w-28" />
    </div>
  );
};

export const LlmConfigSkeleton: React.FC = () => {
  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
      <div className="flex items-center gap-3 border-b border-[#202937] pb-4">
        <Skeleton className="w-10 h-10 rounded-xs" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xs" />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-full rounded-xs" />
      </div>
    </div>
  );
};
