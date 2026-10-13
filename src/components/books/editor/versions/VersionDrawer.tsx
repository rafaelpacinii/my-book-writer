"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VersionDrawerHeader } from "./VersionDrawerHeader";
import { TrackChangesToggle } from "./TrackChangesToggle";
import { NewSnapshotForm } from "./NewSnapshotForm";
import { VersionList } from "./VersionList";
import { DeleteVersionModal } from "@/components/books/versions/DeleteVersionModal";
import type { VersionDrawerProps } from "./types";

export function VersionDrawer(props: VersionDrawerProps) {
  const {
    isOpen, onClose, versions, selectedVersion,
    trackChanges, onToggleTrackChanges, onCreateSnapshot,
    onDeleteVersion, bookId, chapterId,
  } = props;

  const router = useRouter();
  const [versionToDelete, setVersionToDelete] = useState<{ id: string; versionNumber: number } | null>(null);

  if (!isOpen) return null;

  const handleSelect = (versionId: string) => {
    if (!bookId || !chapterId) return;
    router.push(
      `/books/versions?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}&versionId=${encodeURIComponent(versionId)}`
    );
  };

  const handleRequestDelete = (versionId: string) => {
    const target = versions.find((v) => v.id === versionId);
    setVersionToDelete({ id: versionId, versionNumber: target?.version_number ?? 0 });
  };

  const handleConfirmDelete = async () => {
    if (!versionToDelete) return;
    await onDeleteVersion(versionToDelete.id);
    setVersionToDelete(null);
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-border bg-surface flex flex-col shrink-0 h-full z-20">
      <VersionDrawerHeader
        count={versions.length}
        onClose={onClose}
        bookId={bookId}
        chapterId={chapterId}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <TrackChangesToggle enabled={trackChanges} onToggle={onToggleTrackChanges} />
        <NewSnapshotForm onCreate={onCreateSnapshot} />
        <VersionList
          versions={versions}
          selectedId={selectedVersion?.id}
          onSelect={handleSelect}
          onDelete={handleRequestDelete}
        />
      </div>
      <DeleteVersionModal
        isOpen={Boolean(versionToDelete)}
        onClose={() => setVersionToDelete(null)}
        onConfirm={handleConfirmDelete}
        versionNumber={versionToDelete?.versionNumber}
      />
    </aside>
  );
}
