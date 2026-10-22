"use client";

import React from "react";
import { VersionsHeader } from "./VersionsHeader";
import { VersionsWorkspace } from "./VersionsWorkspace";
import { useVersionsPage } from "./useVersionsPage";

interface MainProps {
  bookId: string;
  chapterId: string;
  initialVersionId?: string;
}

export function Main({ bookId, chapterId, initialVersionId }: MainProps) {
  const state = useVersionsPage(bookId, chapterId, initialVersionId);

  if (state.isLoading && !state.selectedVersion && state.versions.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <div className="h-[72px] px-6 border-b border-border bg-surface animate-pulse" />
        <div className="flex-1 flex items-center justify-center text-sm text-muted">
          Carregando histórico de versões...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <VersionsHeader
        bookId={bookId}
        chapterId={chapterId}
        bookTitle={state.bookTitle}
        chapterTitle={state.chapterTitle}
        versionNumber={state.selectedVersion?.version_number}
        onRestore={state.restoreCurrentVersion}
      />
      <VersionsWorkspace state={state} />
    </div>
  );
}

