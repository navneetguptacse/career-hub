import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon-sm" | "icon-md";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3178C6] disabled:opacity-50 disabled:pointer-events-none rounded-xs select-none shrink-0";

    const variantStyles = {
      primary:
        "bg-[#3178C6] text-white hover:bg-[#235A97] active:bg-[#1d4a7d] shadow-xs",
      secondary:
        "bg-[#18202C] text-[#F1F5F9] hover:bg-[#202937] border border-[#202937]",
      outline:
        "border border-[#202937] bg-transparent text-[#F1F5F9] hover:bg-[#12171F] hover:border-[#3178C6]",
      danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C]",
      ghost: "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs gap-2",
      lg: "h-10 px-5 text-sm gap-2",
      "icon-sm": "h-8 w-8 p-0 text-xs",
      "icon-md": "h-9 w-9 p-0 text-xs",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
