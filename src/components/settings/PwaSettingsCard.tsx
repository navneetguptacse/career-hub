"use client";

import React, { useState } from "react";
import { AppWindow, CheckCircle2, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";
import { PwaIosModal } from "@/components/pwa/PwaIosModal";

export const PwaSettingsCard: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isIos,
    showIosGuide,
    setShowIosGuide,
    install,
  } = usePwaInstall();

  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  return (
    <>
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
              <AppWindow className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                <span>Progressive Web App</span>
                {isInstalled && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-1.5 py-0.2 rounded-xs">
                    <CheckCircle2 className="w-3 h-3" /> Installed
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Install CareerHub as a native desktop or mobile application.
              </p>
            </div>
          </div>

          {isInstalled ? (
            <div className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs shrink-0 select-none">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standalone Mode Active</span>
            </div>
          ) : isInstallable ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isInstalling}
              icon={
                isIos ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )
              }
              onClick={handleInstall}
              className="shrink-0"
            >
              <span>{isIos ? "Add to Home Screen" : "Install App"}</span>
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">Application Mode</div>
            <div className="text-[#F1F5F9] font-medium flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-xs ${
                  isInstalled ? "bg-[#10B981]" : "bg-[#3178C6]"
                }`}
              />
              <span>
                {isInstalled
                  ? "Standalone Window (PWA)"
                  : "Browser Tab Session"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-1">
            <div className="text-[#64748B]">Service Worker & Offline Cache</div>
            <div className="text-[#F1F5F9] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
              <span>Active (Cache v1)</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          The Progressive Web App enables instant launching from your dock,
          independent window multitasking without URL bars, and high-speed
          caching for quick job pipeline updates.
        </p>
      </div>

      <PwaIosModal
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
      />
    </>
  );
};
