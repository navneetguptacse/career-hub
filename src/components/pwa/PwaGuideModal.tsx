"use client";

import React from "react";
import {
  Download,
  ExternalLink,
  MoreVertical,
  PlusSquare,
  Share,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: {
    isIos: boolean;
    isAndroid: boolean;
    isInAppBrowser: boolean;
  };
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({
  isOpen,
  onClose,
  platform,
}) => {
  const { isIos, isInAppBrowser } = platform;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isInAppBrowser
          ? "Open in Browser to Install"
          : isIos
            ? "Install CareerHub on iOS"
            : "Install CareerHub on Android"
      }
      description={
        isInAppBrowser
          ? "In-app browsers (like Telegram) cannot install apps directly. Open in your full browser to install."
          : isIos
            ? "Add CareerHub to your iPhone or iPad home screen for standalone fullscreen launch."
            : "Add CareerHub to your Android home screen for quick dock launching and offline support."
      }
      className="max-w-md"
    >
      <div className="space-y-4">
        {isInAppBrowser ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#18202C] border border-[#202937] rounded-xs text-[#5499EB] font-mono text-[11px]">
                    <MoreVertical className="w-3 h-3" /> Menu (⋮ or ⋯)
                  </span>
                  <span>in Telegram</span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Look in the top-right corner of the in-app screen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
                  <span>Tap</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#18202C] border border-[#202937] rounded-xs text-[#5499EB] font-mono text-[11px]">
                    <ExternalLink className="w-3 h-3" /> Open in Safari / Chrome
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Once opened in your system browser, you can install the app
                  directly to your home screen.
                </p>
              </div>
            </div>
          </div>
        ) : isIos ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#18202C] border border-[#202937] rounded-xs text-[#5499EB] font-mono text-[11px]">
                    <Share className="w-3 h-3" /> Share
                  </span>
                  <span>button</span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Located in the Safari toolbar at the bottom of your screen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
                  <span>Select</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#18202C] border border-[#202937] rounded-xs text-[#5499EB] font-mono text-[11px]">
                    <PlusSquare className="w-3 h-3" /> Add to Home Screen
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Scroll down the menu list and tap Add to Home Screen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#18202C] border border-[#202937] rounded-xs text-[#5499EB] font-mono text-[11px]">
                    <MoreVertical className="w-3 h-3" /> Menu (⋮)
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Located in the top right corner of Chrome or Samsung Internet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A0D12] border border-[#202937] rounded-xs">
              <div className="w-7 h-7 bg-[#3178C6]/15 border border-[#3178C6]/30 text-[#3178C6] flex items-center justify-center rounded-xs shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#F1F5F9] flex items-center gap-1.5">
                  <span>Select</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#18202C] border border-[#202937] rounded-xs text-[#5499EB] font-mono text-[11px]">
                    <Download className="w-3 h-3" /> Install app / Add to Home
                  </span>
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Tap Install to create a standalone app shortcut on your
                  device.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-3 border-t border-[#202937]">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};
