"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddJobModal } from "@/components/applications/AddJobModal";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleApplicationAdded = () => {
    window.dispatchEvent(new Event("careerhub:refresh"));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0A0D12] text-[#F1F5F9] flex flex-col">
        <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />
        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0A0D12] transition-all duration-200">
            {children}
          </main>
        </div>

        <AddJobModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleApplicationAdded}
        />
      </div>
    </SidebarProvider>
  );
}
