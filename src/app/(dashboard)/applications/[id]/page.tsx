"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { JobProfileDetails } from "@/components/applications/JobProfileDetails";

export default function ApplicationDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const router = useRouter();

  const handleDelete = async (deleteId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/applications/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/applications");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
          <Briefcase className="w-3.5 h-3.5 text-[#3178C6]" />
          <span>Job Profile Overview</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="p-6 bg-[#12171F] border border-[#202937] rounded-xs shadow-xs">
        <JobProfileDetails applicationId={id} onDelete={handleDelete} />
      </div>
    </div>
  );
}
