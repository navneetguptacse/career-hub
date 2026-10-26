"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon, GitHubIcon } from "@/components/ui/Icons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password credentials");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl });
  };

  const isDeleted = searchParams.get("deleted") === "true";

  return (
    <div className="w-full max-w-sm p-6 bg-[#12171F] border border-[#202937] rounded-xs shadow-2xl space-y-5">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-9 h-9 bg-[#3178C6] text-white font-mono font-bold text-sm rounded-xs mb-1">
          CH
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-[#F1F5F9]">
          Sign in to CareerHub
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Track applications, sync Telegram links, and accelerate your career.
        </p>
      </div>

      {isDeleted && (
        <div className="p-2.5 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs">
          Your account and all associated data have been permanently deleted.
        </div>
      )}

      {error && (
        <div className="p-2.5 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
          {error}
        </div>
      )}

      {/* OAuth Providers */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-center gap-2"
          onClick={() => handleOAuthSignIn("google")}
        >
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span>Continue with Google</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="w-full justify-center gap-2"
          onClick={() => handleOAuthSignIn("github")}
        >
          <GitHubIcon className="w-4 h-4 shrink-0" />
          <span>Continue with GitHub</span>
        </Button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[#202937]" />
        <span className="absolute px-2 text-[10px] text-[#64748B] bg-[#12171F] uppercase">
          Or Credentials
        </span>
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-3">
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

        <Input
          id="password"
          type="password"
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center gap-1.5 mt-2"
          isLoading={isLoading}
        >
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      <div className="pt-3 border-t border-[#202937] text-center text-xs text-[#94A3B8]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#3178C6] hover:text-[#5499EB] font-medium"
        >
          Create one now
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center p-4">
      <Suspense
        fallback={<div className="text-xs text-[#94A3B8]">Loading...</div>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
