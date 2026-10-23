"use client";

import React from "react";
import { captureReviewAnchor } from "@/lib/editor/reviewSelection";
import { EditorSidebar } from "./EditorSidebar";
import { EditorCanvasSwitcher } from "./EditorCanvasSwitcher";
import { EditorReviewPanel } from "./review/EditorReviewPanel";
import { EditorVersionPanel } from "./EditorVersionPanel";
import { EditorFloatingToolbar } from "./EditorFloatingToolbar";
import { useSelectionToolbar } from "@/hooks/useSelectionToolbar";
import type { EditorWorkspaceProps } from "./editorWorkspaceTypes";

export function EditorWorkspace(props: EditorWorkspaceProps) {
  const {
    ed, rev, ver, chapterId, bookId, headingNumber,
    isReviewOpen, onOpenReview, onCloseReview,
    isVersionOpen, onCloseVersion,
  } = props;
  const { position, clearSelection } = useSelectionToolbar();

  const handleCommentSelection = () => {
    if (rev.isPending) return;
    const anchor = captureReviewAnchor();
    if (!anchor) return;
    rev.updateDraft({ anchor });
    onOpenReview();
    clearSelection();
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      <EditorFloatingToolbar
        position={position}
        onFormat={ed.handleFormat}
        onComment={handleCommentSelection}
      />
      {!ed.isFocusMode && (
        <EditorSidebar
          chapters={ed.chapters} currentChapterId={chapterId} isOpen={ed.isDrawerOpen}
          onToggleOpen={() => ed.setIsDrawerOpen(!ed.isDrawerOpen)} onSelectChapter={ed.handleSelectChapter}
          onDeleteChapter={ed.requestDeleteChapter}
          onNewChapterClick={() => ed.setIsNewChapterModalOpen(true)} onReorderChapters={ed.handleReorderChapters}
        />
      )}
      <EditorCanvasSwitcher
        viewMode={ed.viewMode} book={ed.book} format={ed.bookFormat} font={ed.bookFont} bookId={bookId}
        chapterNumber={headingNumber} title={ed.title} onTitleChange={ed.setTitle} contentRef={ed.contentRef}
        text={ed.text} onTextChange={ed.setText} onSelectionChange={ed.updateActiveStyles}
        prevChapter={ed.prevChapter} nextChapter={ed.nextChapter} isFocusMode={ed.isFocusMode}
        onExitFocus={() => ed.setIsFocusMode(false)} isFitMode={ed.isFitMode} onFitModeChange={ed.setIsFitMode}
      />
      <EditorReviewPanel
        rev={rev} isOpen={isReviewOpen && !ed.isFocusMode} onClose={onCloseReview}
      />
      <EditorVersionPanel
        ver={ver} ed={ed} bookId={bookId} chapterId={chapterId}
        isOpen={isVersionOpen && !ed.isFocusMode} onClose={onCloseVersion}
      />
    </div>
  );
}
