"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddJobModal } from "@/components/applications/AddJobModal";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";
import { refreshAllApplications } from "@/lib/hooks/useApplications";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

function DashboardLayoutContent({
  children,
  onOpenAddModal,
  onOpenShortcuts,
}: {
  children: React.ReactNode;
  onOpenAddModal: () => void;
  onOpenShortcuts: () => void;
}) {
  const { isCollapsed } = useSidebar();
  useKeyboardShortcuts();

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#0A0D12] text-[#F1F5F9] flex flex-col">
      <Navbar
        onOpenAddModal={onOpenAddModal}
        onOpenShortcuts={onOpenShortcuts}
      />
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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleOpenAdd = () => setIsAddModalOpen(true);
    const handleOpenShortcuts = () => setIsShortcutsOpen(true);

    window.addEventListener("careerhub:open-add-job", handleOpenAdd);
    window.addEventListener("careerhub:open-shortcuts", handleOpenShortcuts);

    return () => {
      window.removeEventListener("careerhub:open-add-job", handleOpenAdd);
      window.removeEventListener(
        "careerhub:open-shortcuts",
        handleOpenShortcuts
      );
    };
  }, []);

  const handleApplicationAdded = () => {
    refreshAllApplications();
    window.dispatchEvent(new Event("careerhub:refresh"));
  };

  return (
    <SidebarProvider>
      <DashboardLayoutContent
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      >
        {children}
      </DashboardLayoutContent>

      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleApplicationAdded}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </SidebarProvider>
  );
}
