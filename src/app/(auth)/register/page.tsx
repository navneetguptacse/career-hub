"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon, GitHubIcon } from "@/components/ui/Icons";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating account");
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
            Create CareerHub Account
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Automate job tracking and ingest opportunities straight from
            Telegram.
          </p>
        </div>

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
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Sign up with Google</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            <GitHubIcon className="w-4 h-4 shrink-0" />
            <span>Sign up with GitHub</span>
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[#202937]" />
          <span className="absolute px-2 text-[10px] text-[#64748B] bg-[#12171F] uppercase">
            Or Credentials
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <Input
            id="name"
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />

          <Input
            id="email"
            type="email"
            label="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center gap-1.5 mt-2"
            isLoading={isLoading}
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-3 border-t border-[#202937] text-center text-xs text-[#94A3B8]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#3178C6] hover:text-[#5499EB] font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
