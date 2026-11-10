"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";
import { PwaGuideModal } from "./PwaGuideModal";

export const PwaInstallPrompt: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    showGuide,
    setShowGuide,
    platform,
    install,
    dismissBanner,
    isBannerDismissed,
  } = usePwaInstall();

  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  const showBanner = !isInstalled && isInstallable && !isBannerDismissed;

  return (
    <>
      {showBanner && (
        <aside
          aria-label="Install Career Hub Application"
          className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-auto sm:right-5 sm:max-w-sm z-40 p-4 bg-[#12171F] border border-[#202937] hover:border-[#3178C6]/50 rounded-xs shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/icon.svg"
                alt="Career Hub"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xs shadow-xs shrink-0"
              />
              <div>
                <h3 className="text-xs font-semibold text-[#F1F5F9] leading-tight">
                  Install Career Hub
                </h3>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Faster launch and standalone app window
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissBanner}
              title="Dismiss install prompt"
              aria-label="Dismiss install prompt"
              className="w-6 h-6 inline-flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#18202C] rounded-xs transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#94A3B8] mt-2.5 leading-relaxed">
            Install Career Hub on your device for one-click access from your
            dock, smooth offline mode, and quick job application tracking.
          </p>

          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[#202937]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={dismissBanner}
              disabled={isInstalling}
            >
              Not now
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isInstalling}
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleInstall}
            >
              Install
            </Button>
          </div>
        </aside>
      )}

      <PwaGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        platform={platform}
      />
    </>
  );
};
