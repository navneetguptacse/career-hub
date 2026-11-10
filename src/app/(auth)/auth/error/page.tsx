"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface ErrorDetails {
  title: string;
  description: string;
}

const AUTH_ERROR_MAP: Record<string, ErrorDetails> = {
  Configuration: {
    title: "Server Configuration Error",
    description:
      "There is a problem with the authentication server configuration.",
  },
  AccessDenied: {
    title: "Access Denied",
    description:
      "You do not have permission to sign in with this account, or the authorization request was declined.",
  },
  Verification: {
    title: "Verification Link Expired",
    description:
      "This sign-in or verification link is no longer valid. It may have already been used or expired.",
  },
  OAuthSignin: {
    title: "OAuth Sign-In Failed",
    description:
      "Unable to initiate authentication with the selected provider. Please check the provider setup and try again.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description:
      "Authentication failed while processing the response from your OAuth provider. Confirm your callback URL and credentials match.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description:
      "Unable to create a Career Hub account using the selected OAuth provider.",
  },
  EmailCreateAccount: {
    title: "Account Creation Failed",
    description:
      "Unable to create a Career Hub account with this email address.",
  },
  Callback: {
    title: "Authentication Callback Error",
    description:
      "An unexpected error occurred during the authentication callback. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    description:
      "An account with this email already exists using a different sign-in method. Please sign in with your original method.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access the requested page.",
  },
  Default: {
    title: "Authentication Error",
    description:
      "An unexpected error occurred while signing you in. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get("error")?.trim() || "Default";
  const details = AUTH_ERROR_MAP[rawError] || AUTH_ERROR_MAP.Default;

  return (
    <div className="w-full max-w-md p-6 bg-[#12171F] border border-[#202937] rounded-xs shadow-2xl space-y-5">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center mb-1">
          <Image
            src="/icons/icon.svg"
            alt="Career Hub"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xs shadow-xs"
            priority
          />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-[#F1F5F9]">
          {details.title}
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          {details.description}
        </p>
      </div>

      <div className="pt-4 border-t border-[#202937] flex flex-wrap gap-2">
        <Link href="/login" className="flex-1 min-w-34">
          <Button
            type="button"
            variant="primary"
            className="w-full justify-center gap-1.5 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back to Sign In</span>
          </Button>
        </Link>

        <Link href="/" className="flex-1 min-w-34">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center gap-1.5 whitespace-nowrap"
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>Return Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-[#12171F] border border-[#202937] rounded-xs p-6 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-9 w-9 mx-auto rounded-xs" />
              <Skeleton className="h-5 w-48 mx-auto" />
              <Skeleton className="h-4 w-72 mx-auto" />
            </div>
            <div className="pt-4 border-t border-[#202937] flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-xs" />
              <Skeleton className="h-9 flex-1 rounded-xs" />
            </div>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
