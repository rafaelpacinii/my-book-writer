import React from "react";
import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";
import { EditorHeaderActions } from "./EditorHeaderActions";
import type { EditorHeaderProps } from "./editorHeaderTypes";

export function EditorHeader(props: EditorHeaderProps) {
  const {
    bookId, bookTitle, chapterNumber, chapterTitle,
    saveStatus, isFocusMode, onToggleFocus, onSave,
    isReviewOpen, onToggleReview, openCommentsCount, needsRecheck,
    isVersionOpen, onToggleVersion, versionsCount,
  } = props;

  return (
    <header className="min-h-[72px] flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 select-none">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <BookBreadcrumbs bookId={bookId} bookTitle={bookTitle} current="Editor" />
          <span className="text-xs text-muted truncate">
            {chapterNumber ? `${chapterNumber} · ` : ""}{chapterTitle || "Sem título"}
          </span>
        </div>
      </div>

      <EditorHeaderActions
        saveStatus={saveStatus}
        isFocusMode={isFocusMode}
        onToggleFocus={onToggleFocus}
        onSave={onSave}
        isReviewOpen={isReviewOpen}
        onToggleReview={onToggleReview}
        openCommentsCount={openCommentsCount}
        needsRecheck={needsRecheck}
        isVersionOpen={isVersionOpen}
        onToggleVersion={onToggleVersion}
        versionsCount={versionsCount}
      />
    </header>
  );
}
