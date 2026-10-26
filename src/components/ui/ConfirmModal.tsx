"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Job Application",
  description = "Are you sure you want to delete this job application? This action cannot be undone.",
  confirmText = "Delete Application",
  cancelText = "Cancel",
  isConfirming = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
          <div className="w-8 h-8 rounded-xs bg-[#EF4444]/20 flex items-center justify-center shrink-0 text-[#EF4444]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs text-[#94A3B8] leading-relaxed pt-0.5">
            {description}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#202937]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isConfirming}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
