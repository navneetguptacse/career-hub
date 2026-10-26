"use client";

import React, { useState } from "react";
import {
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
} from "lucide-react";
import { KanbanBoard } from "@/components/applications/KanbanBoard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { JobApplicationItem } from "@/components/applications/JobCard";
import { ApplicationStatusType } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EditJobModal } from "@/components/applications/EditJobModal";
import { useApplications } from "@/lib/hooks/useApplications";

export default function ApplicationsPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [jobToDelete, setJobToDelete] = useState<JobApplicationItem | null>(
    null
  );
  const [jobToEdit, setJobToEdit] = useState<JobApplicationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    applications,
    isLoading,
    updateStatus,
    deleteApplication,
    mutate,
  } = useApplications({
    search,
    status: statusFilter,
  });

  const handleStatusChange = (
    id: string,
    newStatus: ApplicationStatusType
  ) => {
    updateStatus(id, newStatus);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await deleteApplication(jobToDelete.id);
      setJobToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Action and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#12171F] border border-[#202937] rounded-xs">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by company, role, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs placeholder:text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#3178C6]"
            />
          </div>
        </div>

        {/* Filters and View Mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <div
              title="Filter by status"
              className="h-8 w-8 inline-flex items-center justify-center border border-[#202937] bg-[#0A0D12] text-[#94A3B8] rounded-xs shrink-0 select-none shadow-xs"
            >
              <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 pl-2.5 pr-7 text-xs bg-[#0A0D12] text-[#F1F5F9] border border-[#202937] rounded-xs focus:outline-none focus:border-[#3178C6] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="WISHLIST">Wishlist</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="h-4 w-px bg-[#202937]" />

          {/* Toggle View */}
          <div className="flex items-center bg-[#0A0D12] p-0.5 border border-[#202937] rounded-xs h-8">
            <button
              onClick={() => setViewMode("kanban")}
              title="Kanban"
              className={`h-7 px-2 inline-flex items-center justify-center rounded-xs transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#3178C6] text-white"
                  : "text-[#94A3B8] hover:text-[#F1F5F9]"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Table view"
              className={`h-7 px-2 inline-flex items-center justify-center rounded-xs transition-colors ${
                viewMode === "table"
                  ? "bg-[#3178C6] text-white"
                  : "text-[#94A3B8] hover:text-[#F1F5F9]"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-[#94A3B8]">
          Loading pipeline applications...
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={(job) => setJobToDelete(job)}
          onEdit={(job) => setJobToEdit(job)}
        />
      ) : (
        <ApplicationTable
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={(job) => setJobToDelete(job)}
          onEdit={(job) => setJobToEdit(job)}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Job Application"
        description={
          jobToDelete
            ? `Are you sure you want to delete ${jobToDelete.jobTitle} at ${jobToDelete.companyName}? This action cannot be undone.`
            : "Are you sure you want to delete this application?"
        }
        confirmText="Delete Application"
        isConfirming={isDeleting}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        job={jobToEdit}
        isOpen={!!jobToEdit}
        onClose={() => setJobToEdit(null)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
