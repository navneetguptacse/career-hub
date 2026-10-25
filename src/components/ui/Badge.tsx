import React from "react";
import { cn } from "@/lib/utils";

export type ApplicationStatusType =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

interface BadgeProps {
  status: ApplicationStatusType | string;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  WISHLIST: {
    label: "Wishlist",
    bg: "bg-[#1E293B]/60",
    text: "text-[#94A3B8]",
    border: "border-[#334155]",
  },
  APPLIED: {
    label: "Applied",
    bg: "bg-[#3178C6]/15",
    text: "text-[#5499EB]",
    border: "border-[#3178C6]/40",
  },
  SCREENING: {
    label: "Screening",
    bg: "bg-[#6366F1]/15",
    text: "text-[#818CF8]",
    border: "border-[#6366F1]/40",
  },
  INTERVIEW: {
    label: "Interview",
    bg: "bg-[#EAB308]/15",
    text: "text-[#FACC15]",
    border: "border-[#EAB308]/40",
  },
  OFFER: {
    label: "Offer",
    bg: "bg-[#10B981]/15",
    text: "text-[#34D399]",
    border: "border-[#10B981]/40",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-[#EF4444]/15",
    text: "text-[#F87171]",
    border: "border-[#EF4444]/40",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    bg: "bg-[#334155]/30",
    text: "text-[#64748B]",
    border: "border-[#334155]",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  status,
  className,
  size = "md",
}) => {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-[#18202C]",
    text: "text-[#94A3B8]",
    border: "border-[#202937]",
  };

  const sizeClasses =
    size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-xs uppercase tracking-wider",
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        className,
      )}
    >
      {config.label}
    </span>
  );
};
