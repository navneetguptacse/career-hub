"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, FileText, Link2, PencilSparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  AddJobManualForm,
  type JobFormData,
} from "@/components/applications/AddJobManualForm";
import { refreshAllApplications } from "@/lib/hooks/useApplications";
import { capitalizeCompanyName } from "@/lib/scraper";
import { cn } from "@/lib/utils";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const INITIAL_FORM_DATA: JobFormData = {
  companyName: "",
  jobTitle: "",
  location: "",
  locationType: "ONSITE",
  employmentType: "FULL_TIME",
  currency: "USD",
  jobUrl: "",
  jobDescription: "",
  appliedDate: "",
  status: "WISHLIST",
  notes: "",
};

function isValidJobUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  let testUrl = trimmed;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = `https://${testUrl}`;
  }
  try {
    const parsed = new URL(testUrl);
    return Boolean(
      parsed.hostname &&
      parsed.hostname.includes(".") &&
      parsed.hostname.length > 3
    );
  } catch {
    return false;
  }
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"link" | "manual">("link");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM_DATA);

  const { data: llmConfig } = useSWR<{ hasKey?: boolean }>(
    isOpen ? "/api/user/llm" : null,
    fetcher
  );
  const isProviderConfigured = Boolean(llmConfig?.hasKey);

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleScrape = async () => {
    let rawUrl = scrapeUrl.trim();
    if (!rawUrl) return;
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }

    setIsScraping(true);
    setError(null);
    setFormData((prev) => ({ ...prev, jobUrl: rawUrl }));

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse link");

      setFormData((prev) => ({
        ...prev,
        companyName: capitalizeCompanyName(
          data.data.companyName || prev.companyName || "Unknown Company"
        ),
        jobTitle: data.data.jobTitle || prev.jobTitle || "Software Engineer",
        jobUrl: data.data.jobUrl || rawUrl,
        jobDescription: data.data.jobDescription || prev.jobDescription,
        location: data.data.location || prev.location || "",
        locationType: data.data.locationType || prev.locationType || "ONSITE",
        employmentType:
          data.data.employmentType || prev.employmentType || "FULL_TIME",
        currency: data.data.currency || prev.currency || "USD",
        appliedDate: data.data.postedDate || prev.appliedDate || "",
      }));

      setSuccessMessage(
        "Job details extracted! Please review and save your application."
      );
      setActiveTab("manual");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error scraping link");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobTitle) {
      setError("Company Name and Job Title are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyName: capitalizeCompanyName(formData.companyName),
          appliedDate: formData.appliedDate
            ? new Date(formData.appliedDate).toISOString()
            : null,
          salaryMin: null,
          salaryMax: null,
          source: formData.jobUrl ? "LINK_SCRAPER" : "MANUAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save application");

      refreshAllApplications();
      onSuccess();
      handleClose();
      setFormData(INITIAL_FORM_DATA);
      setScrapeUrl("");
      setActiveTab("link");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Application"
      description="Track a new role manually or auto-fill details from any job posting URL."
    >
      <div className="space-y-4">
        <div className="flex border-b border-[#202937]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("link");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-2 py-2 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer",
              activeTab === "link"
                ? "border-[#3178C6] text-[#5499EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Import via Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-2 py-2 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer",
              activeTab === "manual"
                ? "border-[#3178C6] text-[#5499EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 text-xs text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 rounded-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-[11px] underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "link" ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F1F5F9]">
                  Job Posting URL
                </label>
                <p className="text-[11px] text-[#94A3B8]">
                  Paste any job link (LinkedIn, Indeed, company careers). We
                  will scrape and structure the details.
                </p>
              </div>

              <input
                type="url"
                placeholder="https://linkedin.com/jobs/view/..."
                value={scrapeUrl}
                onChange={(e) => {
                  setScrapeUrl(e.target.value);
                  setFormData((prev) => ({ ...prev, jobUrl: e.target.value }));
                }}
                className="w-full h-9 px-3 text-xs bg-[#12171F] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6]"
              />

              {isValidJobUrl(scrapeUrl) && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleScrape}
                  isLoading={isScraping}
                  className="w-full gap-2 shadow-xs cursor-pointer"
                >
                  <PencilSparkles className="w-4 h-4" />
                  <span>Extract & Auto-fill Details</span>
                </Button>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-[#202937]/50">
                <span>Powered by AI extraction</span>
                {!isProviderConfigured && (
                  <a
                    href="/settings"
                    className="text-[#5499EB] hover:underline transition-colors"
                  >
                    Configure Provider &rarr;
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#202937]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <AddJobManualForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  );
};
