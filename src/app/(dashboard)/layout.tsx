"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddJobModal } from "@/components/applications/AddJobModal";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";
import { refreshAllApplications } from "@/lib/hooks/useApplications";

function DashboardLayoutContent({
  children,
  onOpenAddModal,
}: {
  children: React.ReactNode;
  onOpenAddModal: () => void;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#0A0D12] text-[#F1F5F9] flex flex-col">
      <Navbar onOpenAddModal={onOpenAddModal} />
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        <Sidebar />
        <main
          className={cn(
            "flex-1 h-full overflow-y-auto p-4 md:p-6 bg-[#0A0D12] transition-all duration-200 min-w-0",
            isCollapsed && "md:pl-16"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleApplicationAdded = () => {
    refreshAllApplications();
    window.dispatchEvent(new Event("careerhub:refresh"));
  };

  return (
    <SidebarProvider>
      <DashboardLayoutContent onOpenAddModal={() => setIsAddModalOpen(true)}>
        {children}
      </DashboardLayoutContent>

      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleApplicationAdded}
      />
    </SidebarProvider>
  );
}
