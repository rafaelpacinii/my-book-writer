"use client";

import React from "react";
import { DiffMetricsAndStepper } from "./DiffMetricsAndStepper";
import type { CompareBase, DiffLayoutMode } from "./types";

interface Props {
  compareBase: CompareBase;
  onCompareBaseChange: (base: CompareBase) => void;
  layoutMode: DiffLayoutMode;
  onLayoutModeChange: (mode: DiffLayoutMode) => void;
  totalChanges: number;
  additions: number;
  deletions: number;
  activeChangeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  hasPreviousVersion: boolean;
}

export function DiffControlsBar(props: Props) {
  const {
    compareBase, onCompareBaseChange, layoutMode, onLayoutModeChange,
    totalChanges, additions, deletions, activeChangeIndex, onNext, onPrev,
    hasPreviousVersion,
  } = props;

  return (
    <div className="h-14 px-6 border-b border-border bg-surface flex items-center justify-between gap-4 select-none shrink-0 overflow-x-auto">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted font-medium">Comparar com:</span>
        <div className="flex p-0.5 rounded-lg border border-control-border bg-surface-hover/40 text-xs">
          <button
            type="button"
            onClick={() => onCompareBaseChange("current")}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
              compareBase === "current" ? "bg-surface text-primary shadow-2xs" : "text-muted hover:text-foreground"
            }`}
          >
            Texto atual
          </button>
          <button
            type="button"
            disabled={!hasPreviousVersion}
            onClick={() => onCompareBaseChange("previous")}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer disabled:opacity-40 ${
              compareBase === "previous" ? "bg-surface text-primary shadow-2xs" : "text-muted hover:text-foreground"
            }`}
          >
            Versão anterior
          </button>
        </div>
      </div>

      <DiffMetricsAndStepper
        totalChanges={totalChanges}
        additions={additions}
        deletions={deletions}
        activeChangeIndex={activeChangeIndex}
        onNext={onNext}
        onPrev={onPrev}
        layoutMode={layoutMode}
        onLayoutModeChange={onLayoutModeChange}
      />
    </div>
  );
}

