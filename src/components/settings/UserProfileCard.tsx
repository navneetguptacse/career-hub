"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CircleCheck, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProfileData {
  id?: string;
  name?: string | null;
  email?: string;
  emailVerified?: string | Date | null;
  role?: string;
  targetRole?: string | null;
  bio?: string | null;
  preferredCurrency?: string;
  createdAt?: string;
  totalApplications?: number;
}

export const UserProfileCard: React.FC = () => {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    targetRole: "",
    bio: "",
    preferredCurrency: "USD",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.user) {
            setProfile({
              name: data.user.name || "",
              targetRole: data.user.targetRole || "",
              bio: data.user.bio || "",
              preferredCurrency: data.user.preferredCurrency || "USD",
              email: data.user.email,
              emailVerified: data.user.emailVerified,
              role: data.user.role,
              createdAt: data.user.createdAt,
              totalApplications: data.user.totalApplications,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setIsSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          targetRole: profile.targetRole,
          bio: profile.bio,
          preferredCurrency: profile.preferredCurrency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsSuccess(true);
        await update({ user: { name: data.user.name } });
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to update profile");
      }
    } catch {
      setErrorMsg("Network error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name?.trim()) {
      return name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
    }
    return email ? email.slice(0, 2).toUpperCase() : "CH";
  };

  return (
    <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#202937] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3178C6] border border-[#3178C6]/50 rounded-xs flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs">
            {getInitials(profile.name, profile.email || session?.user?.email)}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              User Profile
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Customize your target role, preferred currency, and application
              identity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile.role === "ADMIN" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#FACC15] bg-[#EAB308]/15 border border-[#EAB308]/30 rounded-xs font-mono">
              <ShieldCheck className="w-3 h-3" />
              ADMIN
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#94A3B8] bg-[#18202C] border border-[#202937] rounded-xs">
            {profile.totalApplications ?? 0} Apps
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="profile-name"
            label="Full Name"
            placeholder="e.g. Navneet Gupta"
            value={profile.name || ""}
            disabled={isLoading}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />

          <Input
            id="profile-target-role"
            label="Target Role"
            placeholder="e.g. Senior Software Engineer"
            value={profile.targetRole || ""}
            disabled={isLoading}
            onChange={(e) =>
              setProfile({ ...profile, targetRole: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-currency"
              className="block text-xs font-medium text-[#94A3B8] tracking-wide"
            >
              Preferred Currency
            </label>
            <select
              id="profile-currency"
              value={profile.preferredCurrency || "USD"}
              disabled={isLoading}
              onChange={(e) =>
                setProfile({ ...profile, preferredCurrency: e.target.value })
              }
              className="w-full h-9 pl-3 pr-8 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs focus:outline-none focus:border-[#3178C6] transition-colors cursor-pointer"
            >
              <option value="USD">USD ($) — United States Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="CAD">CAD ($) — Canadian Dollar</option>
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="AUD">AUD ($) — Australian Dollar</option>
              <option value="SGD">SGD ($) — Singapore Dollar</option>
              <option value="JPY">JPY (¥) — Japanese Yen</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#94A3B8] tracking-wide">
                Registered Email (Primary)
              </label>
              {profile.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981] font-medium">
                  <CircleCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#F59E0B] font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>
            <div className="h-9 px-3 flex items-center justify-between text-xs bg-[#0A0D12] text-[#94A3B8] border border-[#202937] rounded-xs">
              <span className="truncate">
                {profile.email || session?.user?.email}
              </span>
              {!profile.emailVerified && (
                <button
                  type="button"
                  onClick={async () => {
                    setIsResending(true);
                    setResendMsg(null);
                    try {
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                      });
                      const d = await res.json();
                      if (res.ok) {
                        setResendMsg({
                          type: "success",
                          text: "Verification link sent",
                        });
                      } else {
                        setResendMsg({
                          type: "error",
                          text: d.error || "Failed to send link",
                        });
                      }
                    } catch {
                      setResendMsg({ type: "error", text: "Network error" });
                    } finally {
                      setIsResending(false);
                    }
                  }}
                  disabled={isResending}
                  className="text-[11px] text-[#3178C6] hover:text-[#5499EB] font-medium transition-colors disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Verify"}
                </button>
              )}
            </div>
            {resendMsg && (
              <p
                className={`text-[11px] font-medium ${
                  resendMsg.type === "success"
                    ? "text-[#10B981]"
                    : "text-[#EF4444]"
                }`}
              >
                {resendMsg.text}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-bio"
              className="block text-xs font-medium text-[#94A3B8] tracking-wide"
            >
              Bio
            </label>
            <span className="text-[11px] font-mono text-[#64748B]">
              {(profile.bio || "").length}/1000
            </span>
          </div>
          <textarea
            id="profile-bio"
            rows={3}
            value={profile.bio || ""}
            disabled={isLoading}
            maxLength={1000}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Brief statement of your technical expertise, years of experience, and career goals..."
            className="w-full p-3 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6] transition-colors resize-none"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs text-xs text-[#EF4444]">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#202937]">
          <span className="inline-flex items-center border border-[#202937] rounded-xs px-2.5 py-2 text-[12px] text-[#64748B]">
            {profile.createdAt
              ? `Member since ${new Date(profile.createdAt).getDate()}${
                  ["th", "st", "nd", "rd"][
                    new Date(profile.createdAt).getDate() % 10 > 3 ||
                    Math.floor(
                      (new Date(profile.createdAt).getDate() % 100) / 10
                    ) === 1
                      ? 0
                      : new Date(profile.createdAt).getDate() % 10
                  ]
                } ${new Date(profile.createdAt).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}`
              : "Account Active"}
          </span>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="gap-2 shadow-xs"
          >
            {isSuccess ? (
              <>
                <span>Saved</span>
              </>
            ) : (
              <>
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
