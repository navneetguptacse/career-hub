import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-[#94A3B8] tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          className={cn(
            "w-full h-9 px-3 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs transition-colors placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] focus:ring-1 focus:ring-[#3178C6] disabled:opacity-50 disabled:cursor-not-allowed",
            error &&
              "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
