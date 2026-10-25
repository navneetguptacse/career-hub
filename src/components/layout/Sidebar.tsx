"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Send,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
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
      name: "Telegram & Settings",
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

  return (
    <aside className="w-56 border-r border-[#202937] bg-[#0A0D12] hidden md:flex flex-col justify-between p-3 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
          Pipeline Navigation
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xs transition-colors",
                item.active
                  ? "bg-[#3178C6]/15 text-[#5499EB] border border-[#3178C6]/30"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#12171F]",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border border-[#202937] bg-[#12171F] rounded-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#F1F5F9]">
          <Send className="w-3.5 h-3.5 text-[#3178C6]" />
          <span>Telegram Webhook</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          Drop any job link into your paired Telegram chat to auto-add it here.
        </p>
      </div>
    </aside>
  );
};
