"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { JobApplicationItem } from "./JobCard";
import { ApplicationStatusType } from "@/components/ui/Badge";
import { capitalizeCompanyName } from "@/lib/scraper";

interface EditJobModalProps {
  job: JobApplicationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditJobFormProps {
  job: JobApplicationItem;
  onClose: () => void;
  onSuccess: () => void;
}

const EditJobForm: React.FC<EditJobFormProps> = ({
  job,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(() => ({
    companyName: capitalizeCompanyName(job.companyName),
    jobTitle: job.jobTitle || "",
    location: job.location || "",
    locationType: job.locationType || "ONSITE",
    employmentType: job.employmentType || "FULL_TIME",
    status: job.status || "WISHLIST",
    appliedDate: job.appliedDate
      ? new Date(job.appliedDate).toISOString().slice(0, 10)
      : job.createdAt
        ? new Date(job.createdAt).toISOString().slice(0, 10)
        : "",
    jobUrl: job.jobUrl || "",
    jobDescription: job.jobDescription || "",
    notes: job.notes || "",
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      setError("Company Name and Job Title are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: capitalizeCompanyName(formData.companyName),
          jobTitle: formData.jobTitle.trim(),
          location: formData.location.trim() || null,
          locationType: formData.locationType,
          employmentType: formData.employmentType,
          status: formData.status,
          appliedDate: formData.appliedDate
            ? new Date(formData.appliedDate).toISOString()
            : null,
          jobUrl: formData.jobUrl.trim() || null,
          jobDescription: formData.jobDescription.trim() || null,
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update application");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xs text-xs text-[#EF4444]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Company Name"
          placeholder="Microsoft, Google, Stripe..."
          value={formData.companyName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, companyName: e.target.value }))
          }
          required
        />

        <Input
          label="Job Title"
          placeholder="Senior Software Engineer..."
          value={formData.jobTitle}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">
            Workplace
          </label>
          <select
            value={formData.locationType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                locationType: e.target.value as "REMOTE" | "HYBRID" | "ONSITE",
              }))
            }
            className="w-full h-9 bg-[#0A0D12] border border-[#202937] rounded-xs px-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3178C6]"
          >
            <option value="ONSITE">On-Site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">
            Employment
          </label>
          <select
            value={formData.employmentType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                employmentType: e.target.value,
              }))
            }
            className="w-full h-9 bg-[#0A0D12] border border-[#202937] rounded-xs px-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3178C6]"
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">
            Stage
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as ApplicationStatusType,
              }))
            }
            className="w-full h-9 bg-[#0A0D12] border border-[#202937] rounded-xs px-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3178C6]"
          >
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Location (City, State, Country)"
          placeholder="Redmond, WA, US"
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, location: e.target.value }))
          }
        />

        <Input
          label="Date Posted / Applied"
          type="date"
          value={formData.appliedDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, appliedDate: e.target.value }))
          }
        />
      </div>

      <Input
        label="Job URL"
        type="url"
        placeholder="https://company.com/careers/..."
        value={formData.jobUrl}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, jobUrl: e.target.value }))
        }
      />

      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
          Personal Notes
        </label>
        <textarea
          rows={2}
          placeholder="Recruiter contact, referral status, prep thoughts..."
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="w-full bg-[#0A0D12] border border-[#202937] rounded-xs p-2.5 text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3178C6] resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#202937]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export const EditJobModal: React.FC<EditJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Application"
      description="Refine scraped details or update application parameters."
    >
      <EditJobForm
        key={job.id}
        job={job}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};
