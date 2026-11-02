"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { SHORTCUTS_LIST, ShortcutItem } from "@/lib/hooks/useKeyboardShortcuts";
import { Columns3, Keyboard, Moon, PanelLeft, Plus } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Quick hotkeys to navigate the pipeline, trigger modals, and control the interface."
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div className="border border-[#202937] rounded-xs divide-y divide-[#202937] bg-[#0A0D12]">
          {SHORTCUTS_LIST.map((item: ShortcutItem) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#12171F] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xs bg-[#12171F] border border-[#202937] flex items-center justify-center shrink-0">
                  {getShortcutIcon(item.id)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F1F5F9]">
                      {item.label}
                    </span>
                    <Badge status={item.category} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
          ))}
        </div>

        <div className="p-3 bg-[#12171F] border border-[#202937] rounded-xs flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Shortcuts are disabled while typing in form inputs.</span>
          <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-mono font-medium text-[#64748B] bg-[#0A0D12] border border-[#202937] rounded-xs">
            Esc
          </kbd>
        </div>
      </div>
    </Modal>
  );
};
