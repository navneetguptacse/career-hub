"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Laptop,
  MoreVertical,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform?: {
    isIos?: boolean;
    isAndroid?: boolean;
    isInAppBrowser?: boolean;
    isTablet?: boolean;
    isMobile?: boolean;
    isDesktop?: boolean;
  };
}

type TabType = "ios" | "android" | "desktop";

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({
  isOpen,
  onClose,
  platform,
}) => {
  const isInAppBrowser = Boolean(platform?.isInAppBrowser);

  const detectedTab: TabType = platform?.isIos
    ? "ios"
    : platform?.isAndroid
      ? "android"
      : platform?.isDesktop
        ? "desktop"
        : "ios";

  const [selectedTab, setSelectedTab] = useState<TabType | null>(null);
  const activeTab = selectedTab ?? detectedTab;

  const handleClose = () => {
    setSelectedTab(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Install CareerHub App"
      description="Add CareerHub to your device for instant dock launch, offline support, and fullscreen workflow."
      className="max-w-md"
    >
      <div className="space-y-4">
        {isInAppBrowser && (
          <div className="p-3 bg-[#EAB308]/10 border border-[#EAB308]/30 rounded-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FACC15]">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>In-App Browser Detected</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Social and messaging in-app browsers cannot install web apps
              directly. Tap the menu (
              <MoreVertical className="w-3 h-3 inline" />) in the top corner and
              select{" "}
              <span className="text-[#F1F5F9] font-medium">
                Open in Safari / Chrome
              </span>
              .
            </p>
          </div>
        )}

        <div className="flex items-center gap-1 p-1 bg-[#0A0D12] border border-[#202937] rounded-xs select-none">
          <button
            type="button"
            onClick={() => setSelectedTab("ios")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-xs transition-colors cursor-pointer",
              activeTab === "ios"
                ? "bg-[#3178C6]/15 text-[#5499EB] border border-[#3178C6]/40 font-medium shadow-xs"
                : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-transparent"
            )}
          >
            <Tablet className="w-3.5 h-3.5 shrink-0" />
            <span>iOS / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("android")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-xs transition-colors cursor-pointer",
              activeTab === "android"
                ? "bg-[#3178C6]/15 text-[#5499EB] border border-[#3178C6]/40 font-medium shadow-xs"
                : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-transparent"
            )}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("desktop")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-xs transition-colors cursor-pointer",
              activeTab === "desktop"
                ? "bg-[#3178C6]/15 text-[#5499EB] border border-[#3178C6]/40 font-medium shadow-xs"
                : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18202C] border border-transparent"
            )}
          >
            <Laptop className="w-3.5 h-3.5 shrink-0" />
            <span>Desktop</span>
          </button>
        </div>

        {activeTab === "ios" && (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5 flex-wrap">
                  <span>
                    Tap the <strong>Share</strong> button in Safari
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Located in the Safari toolbar (top-right on iPad and iPad
                  mini, bottom toolbar on iPhone).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5 flex-wrap">
                  <span>
                    Select <strong>Add to Home Screen</strong>
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Scroll down the share sheet and tap Add to Home Screen, then
                  tap Add in the top-right corner.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "android" && (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5 flex-wrap">
                  <span>
                    Tap the <strong>Menu</strong> in Chrome / Browser
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Located in the top-right corner of Chrome, Samsung Internet,
                  or your tablet browser.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5 flex-wrap">
                  <span>
                    Select <strong>Install</strong> /{" "}
                    <strong>Add to Home</strong>
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Tap Install to create a standalone application shortcut on
                  your home screen and app drawer.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "desktop" && (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5 flex-wrap">
                  <span>
                    Look for the <strong>Install</strong> Icon in the URL bar
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  In Chrome, Edge, or Brave, look on the right side of the
                  address bar for the install icon.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5 flex-wrap">
                  <span>Or use browser menu / Add to Dock</span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  In Safari on macOS (Sonoma+), choose File &gt; Add to Dock. In
                  other browsers, click Menu &gt; Install CareerHub.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-3 border-t border-[#202937]">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleClose}
          >
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};
