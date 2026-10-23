"use client";

import React from "react";
import { VersionsSidebar } from "./VersionsSidebar";
import { DiffControlsBar } from "./DiffControlsBar";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffSplitView } from "./DiffSplitView";
import type { VersionsPageState } from "./types";

export function VersionsWorkspace({ state }: { state: VersionsPageState }) {
  const leftLabel = `Snapshot #${(state.compareBase === "current" ? state.selectedVersion : state.previousVersion)?.version_number ?? ""}`;
  const rightLabel = state.compareBase === "current"
    ? "Texto Atual no Editor"
    : `Snapshot #${state.selectedVersion?.version_number ?? ""}`;

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden">
      <VersionsSidebar
        versions={state.versions}
        selectedId={state.selectedVersion?.id}
        onSelect={state.selectVersion}
        onDelete={state.deleteVersion}
      />

      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
        <DiffControlsBar
          compareBase={state.compareBase}
          onCompareBaseChange={state.setCompareBase}
          layoutMode={state.layoutMode}
          onLayoutModeChange={state.setLayoutMode}
          totalChanges={state.diffResult.totalChanges}
          additions={state.diffResult.additions}
          deletions={state.diffResult.deletions}
          activeChangeIndex={state.activeChangeIndex}
          onNext={state.nextChange}
          onPrev={state.prevChange}
          hasPreviousVersion={Boolean(state.previousVersion)}
        />

        <p className="px-4 py-2 text-xs text-muted">A comparação destaca o texto. A restauração também recupera a formatação.</p>
        <div className="flex-1 overflow-y-auto">
          {state.layoutMode === "unified" ? (
            <DiffUnifiedView
              parts={state.diffResult.parts}
              activeChangeIndex={state.activeChangeIndex}
            />
          ) : (
            <DiffSplitView
              parts={state.diffResult.parts}
              activeChangeIndex={state.activeChangeIndex}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

