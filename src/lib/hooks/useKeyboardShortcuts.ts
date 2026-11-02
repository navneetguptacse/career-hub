"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

export interface ShortcutItem {
  id: string;
  label: string;
  description: string;
  keys: string[];
  keyGroups?: string[][];
  category: "Navigation" | "Actions" | "Appearance" | "Help";
}

export const SHORTCUTS_LIST: ShortcutItem[] = [
  {
    id: "sidebar",
    label: "Toggle Sidebar",
    description: "Collapse or uncollapse the left navigation sidebar",
    keys: ["[", "⌘", "B"],
    keyGroups: [["["], ["⌘", "B"]],
    category: "Navigation",
  },
  {
    id: "add-app",
    label: "Add Application",
    description: "Open the new job application creation modal",
    keys: ["A", "C"],
    keyGroups: [["A"], ["C"]],
    category: "Actions",
  },
  {
    id: "theme",
    label: "Toggle Theme",
    description: "Switch between dark and light appearance mode",
    keys: ["T"],
    keyGroups: [["T"]],
    category: "Appearance",
  },
  {
    id: "kanban",
    label: "Kanban Mode",
    description: "Enter into Kanban pipeline board view",
    keys: ["K"],
    keyGroups: [["K"]],
    category: "Navigation",
  },
  {
    id: "shortcuts",
    label: "Shortcuts Guide",
    description: "Open the keyboard shortcuts quick-reference modal",
    keys: ["?"],
    keyGroups: [["?"]],
    category: "Help",
  },
];

export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable ||
    target.getAttribute("role") === "textbox"
  );
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const inInput = isInputElement(e.target);

      if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (inInput) return;

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "[") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (e.key === "a" || e.key === "A" || e.key === "c" || e.key === "C") {
        e.preventDefault();
        window.dispatchEvent(new Event("careerhub:open-add-job"));
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (pathname === "/applications") {
          window.dispatchEvent(new Event("careerhub:view-kanban"));
        } else {
          router.push("/applications");
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        window.dispatchEvent(new Event("careerhub:open-shortcuts"));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, toggleTheme, router, pathname]);
}
