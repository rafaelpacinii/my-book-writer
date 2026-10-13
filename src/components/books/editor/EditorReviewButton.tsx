"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  openCommentsCount: number;
  needsRecheck: boolean;
}

export function EditorReviewButton({
  isOpen,
  onToggle,
  openCommentsCount,
  needsRecheck,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`h-11 px-3.5 rounded-lg border text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-2 ${
        isOpen
          ? "bg-primary text-primary-foreground border-transparent"
          : "border-control-border bg-surface hover:bg-surface-hover text-foreground"
      }`}
      title={isOpen ? "Fechar painel de revisão" : "Abrir painel de revisão"}
    >
      <MessageSquare className="w-4 h-4" />
      <span className="hidden md:inline">Revisão</span>
      {openCommentsCount > 0 && (
        <span
          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
            isOpen
              ? "bg-primary-foreground text-primary"
              : "bg-warning text-primary-foreground"
          }`}
        >
          {openCommentsCount}
        </span>
      )}
      {needsRecheck && openCommentsCount === 0 && (
        <span className="w-2 h-2 rounded-full bg-warning" />
      )}
    </button>
  );
}

