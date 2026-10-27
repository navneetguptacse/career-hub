"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to dispatch password reset link");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 bg-[#12171F] border border-[#202937] rounded-xs shadow-2xl space-y-5">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-[#3178C6] text-white font-mono font-bold text-sm rounded-xs mb-1">
            CH
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-[#F1F5F9]">
            Forgot your password?
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Enter your account email to receive a password reset link.
          </p>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-3 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Reset link dispatched</p>
                <p className="mt-1 text-[#94A3B8] leading-relaxed">
                  If an account exists for{" "}
                  <span className="text-[#F1F5F9] font-mono">{email}</span>, a
                  reset link will arrive shortly. The link expires in 1 hour.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              id="email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center gap-1.5 mt-2"
              isLoading={isLoading}
            >
              <span>Send Reset Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        )}

        <div className="pt-3 border-t border-[#202937] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#3178C6] hover:text-[#5499EB] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
