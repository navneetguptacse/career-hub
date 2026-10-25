import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  sizeVariant?: "sm" | "md";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      children,
      label,
      error,
      id,
      sizeVariant = "md",
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-[#94A3B8] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={id}
            ref={ref}
            className={cn(
              "w-full pl-3 pr-8 text-[#F1F5F9] bg-[#0A0D12] border border-[#202937] rounded-xs appearance-none cursor-pointer transition-colors focus:outline-none focus:border-[#3178C6] focus:ring-1 focus:ring-[#3178C6] disabled:opacity-50",
              sizeVariant === "sm" ? "h-8 text-xs" : "h-9 text-sm",
              error &&
                "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0 select-none" />
        </div>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
