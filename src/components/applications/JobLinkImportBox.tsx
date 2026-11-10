"use client";

import React from "react";
import {
  CheckCircle2,
  IterationCcw,
  Link2,
  PencilSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isValidJobUrl } from "@/lib/validations";

interface JobLinkImportBoxProps {
  scrapeUrl: string;
  isScraping: boolean;
  isProviderConfigured: boolean;
  onUrlChange: (url: string) => void;
  onScrape: () => void;
}

export const JobLinkImportBox: React.FC<JobLinkImportBoxProps> = ({
  scrapeUrl,
  isScraping,
  isProviderConfigured,
  onUrlChange,
  onScrape,
}) => {
  return (
    <div className="p-3 bg-[#0A0D12] border border-[#202937] rounded-xs space-y-2.5">
      <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5 text-[#3178C6]" />
        Import via Link
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://www.linkedin.com/jobs/view/..."
          value={scrapeUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1 h-9 px-3 text-xs bg-[#12171F] border border-[#202937] rounded-xs text-[#F1F5F9] placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6]"
        />
        {isValidJobUrl(scrapeUrl) && (
          <Button
            type="button"
            variant="primary"
            size="icon-md"
            onClick={onScrape}
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
  );
};
