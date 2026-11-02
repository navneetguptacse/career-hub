"use client";

import React from "react";
import { Columns3, Keyboard, Link2, Moon, PanelLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SHORTCUTS_LIST, ShortcutItem } from "@/lib/hooks/useKeyboardShortcuts";

function getShortcutIcon(id: string) {
  switch (id) {
    case "sidebar":
      return <PanelLeft className="w-4 h-4 text-[#3178C6]" />;
    case "add-app":
      return <Plus className="w-4 h-4 text-[#10B981]" />;
    case "theme":
      return <Moon className="w-4 h-4 text-[#EAB308]" />;
    case "kanban":
      return <Columns3 className="w-4 h-4 text-[#818CF8]" />;
    default:
      return <Keyboard className="w-4 h-4 text-[#94A3B8]" />;
  }
}

export const KeyboardShortcutsCard: React.FC = () => {
  return (
    <div className="hidden lg:block p-5 bg-[#12171F] border border-[#202937] rounded-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202937] pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#3178C6]/20 border border-[#3178C6]/40 rounded-xs flex items-center justify-center text-[#5499EB] shrink-0">
            <Keyboard className="w-4 h-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              <span>Keyboard Shortcuts</span>
              <Badge status="Active" size="sm" className="text-[#10B981]" />
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Global key combinations to navigate the pipeline, trigger modals,
              and control appearance.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            window.dispatchEvent(new Event("careerhub:open-shortcuts"))
          }
          className="gap-1.5 shrink-0 border border-[#202937] hover:border-[#3178C6]"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Quick Reference</span>
        </Button>
      </div>

      <div className="border border-[#202937] rounded-xs divide-y divide-[#202937] bg-[#0A0D12]">
        {SHORTCUTS_LIST.map((item: ShortcutItem) => (
          <div
            key={item.id}
            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#12171F] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xs bg-[#12171F] border border-[#202937] flex items-center justify-center shrink-0">
                {getShortcutIcon(item.id)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#F1F5F9]">
                    {item.label}
                  </span>
                  <Badge status={item.category} size="sm" />
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:self-center pl-11 sm:pl-0">
              <div className="flex items-center gap-2">
                {(item.keyGroups || [item.keys]).map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {gIdx > 0 && (
                      <span className="text-sm text-[#64748B]">/</span>
                    )}
                    <div className="flex items-center gap-1">
                      {group.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-[11px] font-mono font-bold text-[#F1F5F9] bg-[#12171F] border border-[#202937] rounded-xs shadow-xs"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
