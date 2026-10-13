"use client";

import React from "react";
import { VersionDrawer } from "./versions/VersionDrawer";
import type { useChapterVersions } from "@/hooks/useChapterVersions";
import type { useChapterEditor } from "./useChapterEditor";

interface Props {
  ver: ReturnType<typeof useChapterVersions>;
  ed: ReturnType<typeof useChapterEditor>;
  bookId: string;
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditorVersionPanel({ ver, ed, bookId, chapterId, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handleRestore = async (versionId: string) => {
    const updated = await ver.handleRestoreVersion(versionId);
    if (updated) {
      await ed.saveNow();
      window.location.reload();
    }
  };

  return (
    <VersionDrawer
      isOpen={isOpen}
      onClose={onClose}
      bookId={bookId}
      chapterId={chapterId}
      versions={ver.versions}
      selectedVersion={ver.selectedVersion}
      trackChanges={ver.trackChanges}
      onToggleTrackChanges={ver.handleToggleTrackChanges}
      onCreateSnapshot={ver.handleCreateSnapshot}
      onSelectVersion={ver.handleSelectVersion}
      onRestoreVersion={handleRestore}
      onDeleteVersion={ver.handleDeleteVersion}
      isComparing={ver.isComparing}
      onCloseDiff={() => ver.setIsComparing(false)}
      currentContentHtml={ed.text}
    />
  );
}
