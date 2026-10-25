"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  DollarSign,
  PieChart,
  Send,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { JobApplicationItem } from "@/components/applications/JobCard";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const total = applications.length;

  const statusCounts = {
    WISHLIST: applications.filter((a) => a.status === "WISHLIST").length,
    APPLIED: applications.filter((a) => a.status === "APPLIED").length,
    SCREENING: applications.filter((a) => a.status === "SCREENING").length,
    INTERVIEW: applications.filter((a) => a.status === "INTERVIEW").length,
    OFFER: applications.filter((a) => a.status === "OFFER").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  const workplaceCounts = {
    REMOTE: applications.filter((a) => a.locationType === "REMOTE").length,
    HYBRID: applications.filter((a) => a.locationType === "HYBRID").length,
    ONSITE: applications.filter((a) => a.locationType === "ONSITE").length,
  };

  const sourceCounts = {
    TELEGRAM: applications.filter((a) => a.source === "TELEGRAM").length,
    LINK_SCRAPER: applications.filter((a) => a.source === "LINK_SCRAPER")
      .length,
    MANUAL: applications.filter((a) => a.source === "MANUAL").length,
  };

  const salaries = applications
    .flatMap((a) => [a.salaryMin, a.salaryMax])
    .filter((s): s is number => typeof s === "number" && s > 0);

  const avgSalary =
    salaries.length > 0
      ? salaries.reduce((acc, curr) => acc + curr, 0) / salaries.length
      : 0;

  const interviewRate =
    total > 0
      ? Math.round(
          ((statusCounts.SCREENING +
            statusCounts.INTERVIEW +
            statusCounts.OFFER) /
            total) *
            100
        )
      : 0;

  const offerRate =
    total > 0 ? Math.round((statusCounts.OFFER / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs">
        <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
          Application Analytics
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Detailed metrics and pipeline conversion analysis across all tracked
          opportunities.
        </p>
      </div>

      {/* Summary conversion metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <Workflow className="w-3.5 h-3.5 text-[#3178C6]" />
            Interview Conversion Rate
          </span>
          <div className="text-2xl font-bold font-mono text-[#5499EB]">
            {isLoading ? "..." : `${interviewRate}%`}
          </div>
          <p className="text-[11px] text-[#64748B]">
            From submitted to interview stage
          </p>
        </div>

        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
            Offer Conversion Rate
          </span>
          <div className="text-2xl font-bold font-mono text-[#34D399]">
            {isLoading ? "..." : `${offerRate}%`}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Final placements / total applications
          </p>
        </div>

        <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
          <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#EAB308]" />
            Avg. Tracked Compensation
          </span>
          <div className="text-2xl font-bold font-mono text-[#FACC15]">
            {isLoading ? "..." : formatCurrency(avgSalary)}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Computed from recorded salary ranges
          </p>
        </div>
      </div>

      {/* Breakdown sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Pipeline Funnel */}
        <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#202937] pb-3">
            <h3 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              <BarChart className="w-4 h-4 text-[#3178C6]" />
              Pipeline Funnel Breakdown
            </h3>
            <span className="text-xs font-mono text-[#94A3B8]">
              {total} Total
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(statusCounts).map(([st, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#94A3B8]">{st}</span>
                    <span className="font-mono text-[#F1F5F9]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0A0D12] rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-[#3178C6] rounded-xs transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ingestion & Workplace Distribution */}
        <div className="space-y-4">
          {/* Ingestion Source */}
          <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2 border-b border-[#202937] pb-3">
              <Send className="w-4 h-4 text-[#3178C6]" />
              Ingestion Channels
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#0A0D12] border border-[#202937] rounded-xs">
                <span className="text-[#94A3B8]">Telegram Bot Webhook</span>
                <span className="font-mono font-semibold text-[#5499EB]">
                  {sourceCounts.TELEGRAM}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0A0D12] border border-[#202937] rounded-xs">
                <span className="text-[#94A3B8]">Direct URL Scraper</span>
                <span className="font-mono font-semibold text-[#F1F5F9]">
                  {sourceCounts.LINK_SCRAPER}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0A0D12] border border-[#202937] rounded-xs">
                <span className="text-[#94A3B8]">Manual Entry</span>
                <span className="font-mono font-semibold text-[#F1F5F9]">
                  {sourceCounts.MANUAL}
                </span>
              </div>
            </div>
          </div>

          {/* Workplace Distribution */}
          <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2 border-b border-[#202937] pb-3">
              <PieChart className="w-4 h-4 text-[#10B981]" />
              Workplace Distribution
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#0A0D12] border border-[#202937] rounded-xs">
                <div className="text-[11px] text-[#94A3B8]">Remote</div>
                <div className="text-lg font-mono font-bold text-[#F1F5F9] mt-1">
                  {workplaceCounts.REMOTE}
                </div>
              </div>
              <div className="p-2.5 bg-[#0A0D12] border border-[#202937] rounded-xs">
                <div className="text-[11px] text-[#94A3B8]">Hybrid</div>
                <div className="text-lg font-mono font-bold text-[#F1F5F9] mt-1">
                  {workplaceCounts.HYBRID}
                </div>
              </div>
              <div className="p-2.5 bg-[#0A0D12] border border-[#202937] rounded-xs">
                <div className="text-[11px] text-[#94A3B8]">On-site</div>
                <div className="text-lg font-mono font-bold text-[#F1F5F9] mt-1">
                  {workplaceCounts.ONSITE}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
