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

  const saveFirst = async () => {
    if (!await ed.saveNow()) throw new Error("Não foi possível salvar o rascunho. Tente novamente antes de continuar.");
  };

  return (
    <VersionDrawer
      key={chapterId}
      isOpen={isOpen}
      onClose={onClose}
      bookId={bookId}
      chapterId={chapterId}
      versions={ver.versions}
      trackChanges={ver.trackChanges}
      onToggleTrackChanges={async (enabled) => { await saveFirst(); await ver.handleToggleTrackChanges(enabled); }}
      onCreateSnapshot={async (description) => { await saveFirst(); await ver.handleCreateSnapshot(description); }}
      onDeleteVersion={ver.handleDeleteVersion}
      onBeforeNavigate={ed.saveNow}
      isLoading={ver.isLoading}
      error={ver.error}
      onRetry={ver.refreshVersions}
    />
  );
}
