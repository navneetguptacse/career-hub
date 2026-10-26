"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export const DangerZoneCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setConfirmInput("");
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isDeleting) return;
    setIsOpen(false);
    setConfirmInput("");
    setError(null);
  };

  const handleDeleteAccount = async () => {
    if (confirmInput.trim() !== "DELETE") return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      await signOut({ callbackUrl: "/login?deleted=true" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete account."
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-5 bg-[#12171F] border border-[#EF4444]/30 rounded-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xs flex items-center justify-center text-[#EF4444] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#EF4444] flex items-center gap-2">
                Danger
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Permanently purge your account, applications, and all associated
                records.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleOpen}
            className="shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </Button>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Deleting your account will immediately and permanently erase all
          tracked job applications, timeline events, personal notes, Telegram
          pairings, and AI configuration keys. Once confirmed, this action{" "}
          <strong className="text-[#F1F5F9]">
            cannot be reverted or recovered
          </strong>
          .
        </p>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Delete Account Permanently"
        description="This action cannot be undone. All your data will be permanently wiped."
        className="max-w-md"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
              {error}
            </div>
          )}

          <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs space-y-1.5">
            <div className="text-xs font-semibold text-[#EF4444] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Permanent &amp; Non-Revertible</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Once you proceed, your user profile, job applications, interview
              logs, and linked services will be permanently purged from the
              database. No backups or restores will be possible.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#F1F5F9]">
              To confirm, please type{" "}
              <span className="font-mono text-[#EF4444] font-bold">DELETE</span>{" "}
              below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              className="w-full h-9 px-3 text-xs bg-[#0A0D12] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#EF4444] font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202937]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isDeleting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              disabled={confirmInput.trim() !== "DELETE" || isDeleting}
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanently Delete</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
