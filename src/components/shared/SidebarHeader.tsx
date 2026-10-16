"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle }: Props) {
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 py-1 pb-3 border-b border-border">
        <Link
          href="/home"
          className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-primary"
          title="my book writer"
        >
          <BookOpen className="w-5.5 h-5.5" strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          onClick={onToggle}
          title="Expandir menu"
          aria-label="Expandir menu"
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
        >
          <PanelLeftOpen className="w-4.5 h-4.5" strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-1 pb-3 border-b border-border">
      <Link
        href="/home"
        className="flex items-center gap-2.5 min-w-0 group"
        title="my book writer"
      >
        <BookOpen className="w-5.5 h-5.5 text-primary shrink-0" strokeWidth={1.8} />
        <span className="font-bold text-sm tracking-tight text-foreground truncate">
          my book writer
        </span>
      </Link>
      <button
        type="button"
        onClick={onToggle}
        title="Recolher menu"
        aria-label="Recolher menu"
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
      >
        <PanelLeftClose className="w-4.5 h-4.5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

