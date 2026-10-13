"use client";

import React from "react";
import { VersionDrawerHeader } from "./VersionDrawerHeader";
import { TrackChangesToggle } from "./TrackChangesToggle";
import { NewSnapshotForm } from "./NewSnapshotForm";
import { VersionList } from "./VersionList";
import { VersionDiffModal } from "./VersionDiffModal";
import type { VersionDrawerProps } from "./types";

export function VersionDrawer(props: VersionDrawerProps) {
  const {
    isOpen, onClose, versions, selectedVersion,
    trackChanges, onToggleTrackChanges, onCreateSnapshot,
    onSelectVersion, onRestoreVersion, onDeleteVersion,
    isComparing, onCloseDiff, currentContentHtml,
  } = props;

  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 border-l border-border bg-surface flex flex-col shrink-0 h-full z-20">
      <VersionDrawerHeader count={versions.length} onClose={onClose} />
      {isComparing && selectedVersion ? (
        <VersionDiffModal
          version={selectedVersion}
          currentContentHtml={currentContentHtml}
          onClose={onCloseDiff}
          onRestore={() => onRestoreVersion(selectedVersion.id)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <TrackChangesToggle enabled={trackChanges} onToggle={onToggleTrackChanges} />
          <NewSnapshotForm onCreate={onCreateSnapshot} />
          <VersionList
            versions={versions}
            selectedId={selectedVersion?.id}
            onSelect={onSelectVersion}
            onDelete={onDeleteVersion}
          />
        </div>
      )}
    </aside>
  );
}

