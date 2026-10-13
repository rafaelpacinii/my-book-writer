"use client";

import React from "react";
import { X, MessageSquare } from "lucide-react";

interface Props {
  openCommentsCount: number;
  onClose: () => void;
}

export function ReviewDrawerHeader({ openCommentsCount, onClose }: Props) {
  return (
    <div className="h-[72px] px-5 border-b border-border bg-surface flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Revisão</span>
          {openCommentsCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-warning/15 text-warning">
              {openCommentsCount} {openCommentsCount === 1 ? "aberto" : "abertos"}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        title="Fechar painel de revisão"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

