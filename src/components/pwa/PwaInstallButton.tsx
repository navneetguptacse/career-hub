"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/Button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";
import { cn } from "@/lib/utils";

interface PwaInstallButtonProps {
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  compact?: boolean;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  className,
  size = "sm",
  variant = "outline",
  compact = false,
}) => {
  const { isInstallable, isInstalled, install } = usePwaInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInstalling) return;

    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      isLoading={isInstalling}
      icon={<Download className="w-3.5 h-3.5 text-[#3178C6] shrink-0" />}
      onClick={handleInstall}
      title="Install Career Hub Web App"
      aria-label="Install Career Hub Web App"
      className={cn(
        "gap-1.5 text-xs border-[#202937] hover:border-[#3178C6] shadow-xs cursor-pointer h-8 shrink-0",
        compact && "w-8 p-0 sm:w-auto sm:px-3",
        className
      )}
    >
      {compact ? (
        <span className="hidden sm:inline">Install</span>
      ) : (
        <span>Install</span>
      )}
    </Button>
  );
};
