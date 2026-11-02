"use client";

import React from "react";
import { Share, PlusSquare } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PwaIosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaIosModal: React.FC<PwaIosModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install CareerHub on iOS"
      description="Follow these quick steps to add CareerHub to your iPhone or iPad home screen."
      className="max-w-md"
    >
      <div className="space-y-4">
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
                Look for the share icon in the Safari navigation bar at the
                bottom of your screen.
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
                Scroll through the actions list and tap Add to Home Screen.
                CareerHub will launch full-screen like a native app.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-[#202937]">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};
