"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Columns, AlignJustify } from "lucide-react";
import type { DiffLayoutMode } from "./types";

interface Props {
  totalChanges: number;
  additions: number;
  deletions: number;
  activeChangeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  layoutMode: DiffLayoutMode;
  onLayoutModeChange: (mode: DiffLayoutMode) => void;
}

export function DiffMetricsAndStepper(p: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-foreground">{p.totalChanges} alterações</span>
        {p.additions > 0 && <span className="px-1.5 py-0.5 rounded bg-success-soft text-success font-bold">+{p.additions}</span>}
        {p.deletions > 0 && <span className="px-1.5 py-0.5 rounded bg-danger-soft text-danger font-bold">-{p.deletions}</span>}
      </div>

      <div className="flex items-center gap-1 border-l border-border pl-4">
        <button
          type="button" onClick={p.onPrev} disabled={p.totalChanges === 0}
          className="p-1 rounded-md border border-control-border text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
          title="Alteração anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-muted px-2 min-w-[70px] text-center">
          {p.totalChanges > 0 ? `${p.activeChangeIndex}/${p.totalChanges}` : "0/0"}
        </span>
        <button
          type="button" onClick={p.onNext} disabled={p.totalChanges === 0}
          className="p-1 rounded-md border border-control-border text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
          title="Próxima alteração"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center border-l border-border pl-4">
        <button
          type="button"
          onClick={() => p.onLayoutModeChange(p.layoutMode === "unified" ? "split" : "unified")}
          className="p-1.5 rounded-lg border border-control-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          title={p.layoutMode === "unified" ? "Mudar para visão lado a lado" : "Mudar para visão unificada"}
        >
          {p.layoutMode === "unified" ? <Columns className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

