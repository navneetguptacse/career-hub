"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  CheckCircle2,
  IterationCcw,
  Link2,
  PencilSparkles,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { refreshAllApplications } from "@/lib/hooks/useApplications";
import { capitalizeCompanyName } from "@/lib/scraper";
import { isValidJobUrl } from "@/lib/validations";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const INITIAL_FORM_DATA = {
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

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

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

      setSuccessMessage("The details are extracted! Please review and save.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error scraping link");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobTitle) {
      setError("Company and Role are required");
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
        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2.5">
          <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#3178C6]" />
            Import via Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={scrapeUrl}
              onChange={(e) => {
                setScrapeUrl(e.target.value);
                setFormData((prev) => ({ ...prev, jobUrl: e.target.value }));
              }}
              className="flex-1 h-9 px-3 text-xs bg-[#12171F] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6]"
            />
            {isValidJobUrl(scrapeUrl) && (
              <Button
                type="button"
                variant="primary"
                size="icon-md"
                onClick={handleScrape}
                isLoading={isScraping}
                title="Auto-Fill Details"
                className="h-9 w-9 shrink-0 cursor-pointer"
              >
                <PencilSparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
            <span>Powered by AI extraction</span>
            {isProviderConfigured ? (
              <span className="text-[#10B981] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Configured
              </span>
            ) : (
              <a
                href="/settings"
                className="inline-flex items-center gap-1 text-[#5499EB] no-underline transition-colors"
              >
                Configure Provider
                <IterationCcw className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>
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
              className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company *"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="e.g. Stripe"
            />
            <Input
              label="Role *"
              required
              value={formData.jobTitle}
              onChange={(e) =>
                setFormData({ ...formData, jobTitle: e.target.value })
              }
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. San Francisco, CA"
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Workplace
              </label>
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({ ...formData, locationType: e.target.value })
                }
                className="w-full h-9 pl-3 pr-8 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs focus:outline-none focus:border-[#3178C6] cursor-pointer"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full h-9 pl-3 pr-8 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs focus:outline-none focus:border-[#3178C6] cursor-pointer"
              >
                <option value="WISHLIST">Wishlist</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
              </select>
            </div>
          </div>

          <Input
            label="Posting URL"
            type="url"
            value={formData.jobUrl}
            onChange={(e) =>
              setFormData({ ...formData, jobUrl: e.target.value })
            }
            placeholder="https://www.google.com/about/careers/..."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#94A3B8]">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Referral contacts, interview prep notes, questions..."
              className="w-full p-2.5 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#202937]">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Save Application
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
