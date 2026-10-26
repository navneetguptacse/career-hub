"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Send,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar } =
    useSidebar();
  const isAdmin = session?.user?.role === "ADMIN";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Applications",
      href: "/applications",
      icon: Briefcase,
      active: pathname.startsWith("/applications"),
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
    ...(isAdmin
      ? [
          {
            name: "Admin Portal",
            href: "/admin",
            icon: ShieldAlert,
            active: pathname.startsWith("/admin"),
          },
        ]
      : []),
  ];

  const content = (
    <div className="flex flex-col justify-between h-full p-3 overflow-hidden select-none">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              aria-label="Collapse sidebar"
              className="hidden md:flex items-center justify-center h-8 w-8 text-[#94A3B8] hover:text-[#5499EB] bg-[#12171F] border border-[#202937] hover:border-[#3178C6] hover:bg-[#18202C] rounded-xs transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Pipeline
            </span>
          </div>
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileSidebar}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xs transition-colors",
                item.active
                  ? "bg-[#3178C6]/15 text-[#5499EB] border border-[#3178C6]/30 font-semibold"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#12171F]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="p-3 border border-[#202937] bg-[#12171F] rounded-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#F1F5F9]">
            <Send className="w-3.5 h-3.5 text-[#3178C6]" />
            <span>Telegram Webhook</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Drop job links into your paired chat to auto-add cards.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          title="Hide Sidebar"
          aria-label="Hide sidebar"
          className="hidden md:flex w-full items-center justify-center gap-1.5 h-8 text-xs font-medium text-[#64748B] hover:text-[#94A3B8] hover:bg-[#12171F] rounded-xs border border-[#202937] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Hide</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Show button docked at the exact position when sidebar is hidden */}
      {isCollapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          title="Expand Sidebar"
          aria-label="Expand sidebar"
          className="hidden md:flex absolute top-3 left-3 z-20 h-8 w-8 bg-[#12171F] border border-[#202937] hover:border-[#3178C6] hover:bg-[#18202C] rounded-xs items-center justify-center text-[#94A3B8] hover:text-[#5499EB] transition-colors shadow-xs cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Desktop Sidebar (toggleable) */}
      <aside
        className={cn(
          "h-full border-r border-[#202937] bg-[#0A0D12] shrink-0 transition-all duration-200 hidden md:block overflow-hidden",
          isCollapsed ? "w-0 p-0 border-r-0" : "w-56"
        )}
      >
        {!isCollapsed && content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-[#0A0D12] border-r border-[#202937] z-50 md:hidden transition-transform duration-200 flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 border-b border-[#202937] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#3178C6] flex items-center justify-center rounded-xs text-white font-mono font-bold text-sm">
              CH
            </div>
            <span className="font-semibold text-sm text-[#F1F5F9]">
              CareerHub
            </span>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="h-8 w-8 flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] rounded-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{content}</div>
      </aside>
    </>
  );
};
