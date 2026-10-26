"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  ShieldAlert,
  Users,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  telegramChatId?: string | null;
  createdAt: string;
  _count: { applications: number };
}

export default function AdminPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalApplications: number;
  } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch("/api/admin/overview");
        if (!res.ok) {
          throw new Error("Failed to load admin overview");
        }
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.recentUsers || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FACC15]" />
            Administrator Control Center
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            System-wide user records, database telemetry, and pipeline health.
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] rounded-xs">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
              <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#3178C6]" />
                Registered Users
              </span>
              <div className="text-2xl font-bold font-mono text-[#F1F5F9]">
                {isLoading ? "..." : stats?.totalUsers}
              </div>
            </div>

            <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
              <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#10B981]" />
                Total System Applications
              </span>
              <div className="text-2xl font-bold font-mono text-[#34D399]">
                {isLoading ? "..." : stats?.totalApplications}
              </div>
            </div>

            <div className="p-4 bg-[#12171F] border border-[#202937] rounded-xs space-y-1">
              <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#5499EB]" />
                Neon DB Health
              </span>
              <div className="text-sm font-semibold text-[#10B981] flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                Operational & Synced
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#F1F5F9] border-b border-[#202937] pb-3">
              Registered User Roster
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0D12] text-[#94A3B8] font-mono uppercase">
                  <tr>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Applications</th>
                    <th className="px-3 py-2">Telegram Connected</th>
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#202937]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#18202C]">
                      <td className="px-3 py-2.5 font-medium text-[#F1F5F9]">
                        {u.email}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 font-mono text-[10px] bg-[#0A0D12] border border-[#202937] rounded-xs text-[#FACC15]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#5499EB]">
                        {u._count.applications}
                      </td>
                      <td className="px-3 py-2.5">
                        {u.telegramChatId ? (
                          <span className="text-[#10B981]">Yes</span>
                        ) : (
                          <span className="text-[#64748B]">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#64748B]">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
