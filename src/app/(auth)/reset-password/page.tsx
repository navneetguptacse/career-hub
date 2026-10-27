"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="w-full max-w-sm p-6 bg-[#12171F] border border-[#202937] rounded-xs shadow-2xl space-y-4">
        <div className="p-3 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
          Missing reset token. Please request a new password reset link.
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs text-[#3178C6] hover:text-[#5499EB] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to forgot password</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        router.push("/login?reset=true");
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 bg-[#12171F] border border-[#202937] rounded-xs shadow-2xl space-y-5">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-9 h-9 bg-[#3178C6] text-white rounded-xs mb-1">
          <KeyRound className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-[#F1F5F9]">
          Set new password
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Choose a strong password to protect your CareerHub account.
        </p>
      </div>

      {error && (
        <div className="p-2.5 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="password"
          type="password"
          label="New Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          autoComplete="new-password"
        />

        <p className="text-[11px] text-[#64748B]">
          Must contain 8+ characters, at least 1 uppercase letter, and 1 number.
        </p>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center gap-1.5 mt-2"
          isLoading={isLoading}
        >
          <span>Save New Password</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center p-4">
      <Suspense
        fallback={<div className="text-xs text-[#94A3B8]">Loading...</div>}
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
