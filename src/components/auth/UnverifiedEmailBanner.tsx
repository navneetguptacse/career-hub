"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UnverifiedEmailBanner() {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    devUrl?: string;
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
        body: JSON.stringify({ email: session.user.email }),
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
          devUrl: data.devUrl,
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
        message: "Unable to reach server. Please check your connection and try again.",
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
              className={`mt-1 font-medium flex flex-wrap items-center gap-1.5 ${
                feedback.type === "success"
                  ? "text-[#10B981]"
                  : "text-[#EF4444]"
              }`}
            >
              {feedback.type === "success" && (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{feedback.message}</span>
              {feedback.devUrl && (
                <a
                  href={feedback.devUrl}
                  className="px-1.5 py-0.5 bg-[#3178C6] hover:bg-[#235A97] text-white rounded-xs text-[11px] font-semibold tracking-wide transition-colors"
                >
                  Verify Now (Local Dev)
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleResend}
          disabled={cooldown > 0}
          isLoading={isSending}
          className="h-7 px-3 text-xs border border-[#202937] hover:border-[#3178C6] transition-colors"
        >
          <span>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
          </span>
        </Button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
