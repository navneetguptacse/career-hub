"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers2,
  LayoutPanelLeft,
  LogOut,
  Send,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar } =
    useSidebar();
  const { isInstalled, install } = usePwaInstall();
  const isAdmin = session?.user?.role === "ADMIN";

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutPanelLeft,
      active: pathname === "/dashboard",
    },
    {
      name: "Applications",
      href: "/applications",
      icon: Layers2,
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
    {
      name: "Usage",
      href: "/usage",
      icon: BookOpen,
      active: pathname.startsWith("/usage"),
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
    <div className="flex flex-col justify-between h-full p-3 md:pt-6 md:px-5 md:pb-4 overflow-hidden select-none">
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

        {!isInstalled && (
          <button
            type="button"
            onClick={() => {
              closeMobileSidebar();
              void install();
            }}
            className="md:hidden w-full flex items-center justify-center gap-2 h-8 px-3 text-xs font-medium text-[#5499EB] bg-[#3178C6]/15 hover:bg-[#3178C6]/25 border border-[#3178C6]/40 rounded-xs transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#3178C6]" />
            <span>Install CareerHub App</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            closeMobileSidebar();
            setShowLogoutConfirm(true);
          }}
          title="Sign out"
          aria-label="Sign out"
          className="flex w-full items-center justify-center gap-1.5 h-8 text-xs font-medium text-[#64748B] hover:text-[#EF4444] hover:bg-[#12171F] hover:border-[#EF4444]/40 rounded-xs border border-[#202937] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isCollapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          title="Expand Sidebar"
          aria-label="Expand sidebar"
          className="hidden md:flex absolute top-6 left-5 z-20 h-8 w-8 bg-[#12171F] border border-[#202937] hover:border-[#3178C6] hover:bg-[#18202C] rounded-xs items-center justify-center text-[#94A3B8] hover:text-[#5499EB] transition-colors shadow-xs cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <aside
        className={cn(
          "h-full border-r border-[#202937] bg-[#0A0D12] shrink-0 transition-all duration-200 hidden md:block overflow-hidden",
          isCollapsed ? "w-0 p-0 border-r-0" : "w-56"
        )}
      >
        {!isCollapsed && content}
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-[#0A0D12] border-r border-[#202937] z-50 md:hidden transition-transform duration-200 flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 border-b border-[#202937] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 h-8">
            <Image
              src="/icons/icon.svg"
              alt="CareerHub"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xs shadow-xs shrink-0"
            />
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

      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => !isLoggingOut && setShowLogoutConfirm(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to end your current session?"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            You will be signed out of CareerHub on this browser. You can log
            back in at any time with your credentials.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202937]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isLoggingOut}
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={handleLogout}
            >
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
