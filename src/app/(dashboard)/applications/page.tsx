"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { KanbanBoard } from "@/components/applications/KanbanBoard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { JobApplicationItem } from "@/components/applications/JobCard";
import { ApplicationStatusType } from "@/components/ui/Badge";

export default function ApplicationsPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        if (search.trim()) params.append("search", search.trim());

        const res = await fetch(`/api/applications?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    const handleRefresh = () => {
      load();
    };

    window.addEventListener("careerhub:refresh", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("careerhub:refresh", handleRefresh);
    };
  }, [search, statusFilter]);

  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatusType
  ) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        fetchApplications();
      }
    } catch {
      fetchApplications();
    }
  };

  const handleDelete = async (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
    } catch {
      fetchApplications();
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
              title="Kanban Board"
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

          <button
            onClick={() => fetchApplications()}
            title="Refresh pipeline"
            className="h-8 w-8 inline-flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] bg-[#0A0D12] border border-[#202937] rounded-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
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
          onDelete={handleDelete}
        />
      ) : (
        <ApplicationTable
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
