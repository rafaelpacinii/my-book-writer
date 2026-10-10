"use client";

import React from "react";
import { PanelLeftClose } from "lucide-react";

interface Props {
  onToggleOpen: () => void;
}

export function EditorSidebarHeader({ onToggleOpen }: Props) {
  return (
    <div className="flex items-center justify-between px-2 pb-3">
      <p className="text-[11px] font-bold tracking-wider text-muted uppercase">
        Capítulos
      </p>
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        title="Recolher barra lateral"
      >
        <PanelLeftClose className="w-4 h-4" />
      </button>
    </div>
  );
}

