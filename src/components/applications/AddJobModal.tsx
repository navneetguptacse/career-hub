"use client";

import React, { useState } from "react";
import { Link2, PencilSparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    location: "",
    locationType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    jobUrl: "",
    jobDescription: "",
    status: "WISHLIST",
    notes: "",
  });

  const handleScrape = async () => {
    const rawUrl = scrapeUrl.trim();
    if (!rawUrl) return;

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
        companyName:
          data.data.companyName || prev.companyName || "Unknown Company",
        jobTitle: data.data.jobTitle || prev.jobTitle || "Software Engineer",
        jobUrl: data.data.jobUrl || rawUrl,
        jobDescription: data.data.jobDescription || prev.jobDescription,
        location: data.data.location || prev.location || "Remote",
        locationType: data.data.locationType || prev.locationType || "REMOTE",
        employmentType:
          data.data.employmentType || prev.employmentType || "FULL_TIME",
        salaryMin:
          data.data.salaryMin !== null && data.data.salaryMin !== undefined
            ? String(data.data.salaryMin)
            : prev.salaryMin || "120000",
        salaryMax:
          data.data.salaryMax !== null && data.data.salaryMax !== undefined
            ? String(data.data.salaryMax)
            : prev.salaryMax || "160000",
        currency: data.data.currency || prev.currency || "USD",
      }));
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
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
          source: formData.jobUrl ? "LINK_SCRAPER" : "MANUAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save application");

      onSuccess();
      onClose();
      setFormData({
        companyName: "",
        jobTitle: "",
        location: "",
        locationType: "REMOTE",
        employmentType: "FULL_TIME",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        jobUrl: "",
        jobDescription: "",
        status: "WISHLIST",
        notes: "",
      });
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
      onClose={onClose}
      title="Add Application"
      description="Track a new role manually or auto-fill details from any job posting URL."
    >
      <div className="space-y-4">
        {/* Scraper bar */}
        <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2">
          <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#3178C6]" />
            Import Link
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
            <Button
              type="button"
              variant="secondary"
              size="icon-md"
              onClick={handleScrape}
              isLoading={isScraping}
              disabled={isScraping || !scrapeUrl.trim()}
              title="Auto-fill details from URL"
              className="shrink-0"
            >
              <PencilSparkles className="w-4 h-4 text-[#3178C6]" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company Name *"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="e.g. Stripe"
            />
            <Input
              label="Job Title *"
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Salary Min ($)"
              type="number"
              value={formData.salaryMin}
              onChange={(e) =>
                setFormData({ ...formData, salaryMin: e.target.value })
              }
              placeholder="120000"
            />
            <Input
              label="Salary Max ($)"
              type="number"
              value={formData.salaryMax}
              onChange={(e) =>
                setFormData({ ...formData, salaryMax: e.target.value })
              }
              placeholder="160000"
            />
          </div>

          <Input
            label="Job Posting URL"
            type="url"
            value={formData.jobUrl}
            onChange={(e) =>
              setFormData({ ...formData, jobUrl: e.target.value })
            }
            placeholder="https://www.google.com/about/careers/..."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#94A3B8]">
              Personal Notes & Follow-ups
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
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
