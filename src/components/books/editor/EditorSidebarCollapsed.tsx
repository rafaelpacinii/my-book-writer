"use client";

import React from "react";
import { PanelLeft } from "lucide-react";

interface Props {
  onToggleOpen: () => void;
}

export function EditorSidebarCollapsed({ onToggleOpen }: Props) {
  return (
    <aside className="w-12 h-full shrink-0 border-r border-border bg-surface flex flex-col items-center py-4 select-none">
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        title="Abrir lista de capítulos"
      >
        <PanelLeft className="w-5 h-5" />
      </button>
      <div className="mt-6 flex-1 flex flex-col items-center">
        <span className="text-[10px] font-bold text-muted/60 uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
          Capítulos
        </span>
      </div>
    </aside>
  );
}

