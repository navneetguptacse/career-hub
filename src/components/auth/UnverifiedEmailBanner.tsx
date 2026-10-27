"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

export function UnverifiedEmailBanner() {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  if (!session?.user || session.user.emailVerified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    if (isSending || cooldown > 0) return;

    setIsSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to send email",
        });
      } else {
        setFeedback({
          type: "success",
          message: data.message || "Verification email dispatched",
        });
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected network error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative p-3.5 bg-[#12171F] border border-[#F59E0B]/30 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#F1F5F9]">
            Email address unverified
          </p>
          <p className="text-[#94A3B8]">
            Your email{" "}
            <span className="text-[#F1F5F9] font-mono">
              {session.user.email}
            </span>{" "}
            is not verified yet. Confirming protects your account and pipeline
            data.
          </p>
          {feedback && (
            <p
              className={`mt-1 font-medium flex items-center gap-1 ${
                feedback.type === "success"
                  ? "text-[#10B981]"
                  : "text-[#EF4444]"
              }`}
            >
              {feedback.type === "success" && (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending || cooldown > 0}
          className="px-2.5 py-1 text-xs font-medium text-[#F1F5F9] bg-[#1E2736] hover:bg-[#253245] border border-[#2A374A] rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {isSending && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-[#64748B] hover:text-[#94A3B8] transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
