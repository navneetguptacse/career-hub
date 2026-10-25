"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { JobApplicationItem } from "@/components/applications/JobCard";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/applications");
        if (res.ok && isMounted) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("careerhub:refresh", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("careerhub:refresh", handleRefresh);
    };
  }, []);

  const metrics = {
    total: applications.length,
    wishlist: applications.filter((a) => a.status === "WISHLIST").length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    interview: applications.filter((a) =>
      ["SCREENING", "INTERVIEW"].includes(a.status)
    ).length,
    offers: applications.filter((a) => a.status === "OFFER").length,
  };

  const recentApps = applications.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#12171F] border border-[#202937] rounded-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
            Welcome back,{" "}
            {session?.user?.name ||
              session?.user?.email?.split("@")[0] ||
              "Developer"}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Here is your current career pipeline and job application metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/applications">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>View Kanban Board</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Tracked</span>
            <Briefcase className="w-4 h-4 text-[#3178C6]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9]">
            {isLoading ? "..." : metrics.total}
          </div>
          <p className="text-[11px] text-[#64748B]">Across all active stages</p>
        </div>

        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Interviews & Screenings</span>
            <Flame className="w-4 h-4 text-[#EAB308]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FACC15]">
            {isLoading ? "..." : metrics.interview}
          </div>
          <p className="text-[11px] text-[#64748B]">Active interview loops</p>
        </div>

        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Offers Received</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#34D399]">
            {isLoading ? "..." : metrics.offers}
          </div>
          <p className="text-[11px] text-[#64748B]">Successful placements</p>
        </div>

        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Wishlist / Queue</span>
            <Clock className="w-4 h-4 text-[#818CF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#818CF8]">
            {isLoading ? "..." : metrics.wishlist}
          </div>
          <p className="text-[11px] text-[#64748B]">Ready for submission</p>
        </div>
      </div>

      {/* Telegram Automation Banner */}
      <div className="p-4 bg-[#12171F] border border-[#3178C6]/40 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#3178C6]/20 border border-[#3178C6]/40 flex items-center justify-center rounded-xs text-[#5499EB] shrink-0 mt-0.5">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-1.5">
              <span>Automate Pipeline via Telegram</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#3178C6] text-white rounded-xs">
                Bot Webhook
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Link your Telegram group to automatically ingest job postings
              whenever you share a link.
            </p>
          </div>
        </div>

        <Link href="/settings">
          <Button variant="primary" size="sm" className="shrink-0 gap-1.5">
            <span>Configure Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Recent Applications Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
            Recent Applications
          </h2>
          <Link
            href="/applications"
            className="text-xs text-[#3178C6] hover:text-[#5499EB] font-medium"
          >
            View all ({applications.length})
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center border border-[#202937] bg-[#12171F] rounded-xs text-xs text-[#94A3B8]">
            No job applications tracked yet. Click &quot;Add Job&quot; in the
            navigation bar to get started!
          </div>
        ) : (
          <div className="border border-[#202937] rounded-xs bg-[#12171F] divide-y divide-[#202937]">
            {recentApps.map((app) => (
              <div
                key={app.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#18202C] transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-[#F1F5F9]">
                    {app.companyName}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-2">
                    <span>{app.jobTitle}</span>
                    <span className="text-[#64748B]">•</span>
                    <span>{app.locationType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={app.status} size="sm" />
                  <span className="text-xs font-mono text-[#64748B] hidden sm:inline">
                    {formatDate(app.appliedDate || app.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
