"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AutoTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutoTextarea: React.FC<AutoTextareaProps> = ({
  value,
  className,
  rows = 3,
  ...props
}) => {
  const textValue = typeof value === "string" ? value : String(value ?? "");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)]">
      <div
        aria-hidden="true"
        className={cn(
          className,
          "col-start-1 row-start-1 invisible pointer-events-none select-none whitespace-pre-wrap wrap-break-word min-w-0"
        )}
      >
        {textValue ? `${textValue}\u200b` : "\u200b"}
      </div>

      <textarea
        rows={rows}
        value={value}
        className={cn(
          className,
          "col-start-1 row-start-1 h-full min-w-0 overflow-hidden resize-none"
        )}
        {...props}
      />
    </div>
  );
};
