"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface JobFormData {
  companyName: string;
  jobTitle: string;
  location: string;
  locationType: string;
  employmentType: string;
  currency: string;
  jobUrl: string;
  jobDescription: string;
  appliedDate: string;
  status: string;
  notes: string;
}

interface AddJobManualFormProps {
  formData: JobFormData;
  setFormData: React.Dispatch<React.SetStateAction<JobFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const AddJobManualForm: React.FC<AddJobManualFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Company Name *"
          required
          value={formData.companyName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, companyName: e.target.value }))
          }
          placeholder="e.g. Stripe"
        />
        <Input
          label="Job Title *"
          required
          value={formData.jobTitle}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
          }
          placeholder="e.g. Senior Software Engineer"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Location"
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, location: e.target.value }))
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
              setFormData((prev) => ({ ...prev, locationType: e.target.value }))
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
              setFormData((prev) => ({ ...prev, status: e.target.value }))
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
        label="Job Posting URL"
        type="url"
        value={formData.jobUrl}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, jobUrl: e.target.value }))
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
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Referral contacts, interview prep notes, questions..."
          className="w-full p-2.5 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#202937]">
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
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
  );
};
