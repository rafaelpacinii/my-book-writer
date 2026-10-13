"use client";

import React, { useState } from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspace } from "./EditorWorkspace";
import { EditorFooter } from "./EditorFooter";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorNotFound } from "./EditorNotFound";
import { EditorModals } from "./EditorModals";
import { useChapterEditor } from "./useChapterEditor";
import { useReview } from "@/hooks/useReview";
import { formatChapterHeadingLabel } from "@/utils/chapterType";

export function Main({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const ed = useChapterEditor(bookId, chapterId);
  const rev = useReview(chapterId, ed.chapter?.content_revision ?? 1);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const standardIndex = ed.chapters
    .slice(0, ed.currentIndex)
    .filter((c) => (c.chapter_type || "standard") === "standard").length;
  const num = formatChapterHeadingLabel(ed.chapter || { chapter_type: "standard" }, standardIndex);

  if (ed.isLoading && !ed.chapter) return <EditorSkeleton />;
  if (!ed.chapter) return <EditorNotFound bookId={bookId} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {!ed.isFocusMode && (
        <>
          <EditorHeader
            bookId={bookId} bookTitle={ed.book?.title} chapterNumber={num} chapterTitle={ed.title}
            saveStatus={ed.saveStatus} isFocusMode={ed.isFocusMode} onToggleFocus={() => ed.setIsFocusMode(true)}
            onSave={ed.saveNow} isReviewOpen={isReviewOpen} onToggleReview={() => setIsReviewOpen(!isReviewOpen)}
            openCommentsCount={rev.openCommentsCount} needsRecheck={rev.needsRecheck}
          />
          <EditorToolbar
            onFormat={ed.handleFormat} onUndo={ed.handleUndo} onRedo={ed.handleRedo}
            isBold={ed.isBold} isItalic={ed.isItalic} isUnderline={ed.isUnderline}
            fonts={ed.fonts} currentFontId={ed.book?.font_preset_id} onSelectFont={ed.handleUpdateFont}
            fontSizePt={ed.book?.font_size_pt} onSelectFontSize={ed.handleUpdateFontSize}
            onOpenSettings={() => ed.setIsSettingsModalOpen(true)} viewMode={ed.viewMode} onViewModeChange={ed.setViewMode}
          />
        </>
      )}

      <EditorWorkspace
        ed={ed} rev={rev} chapterId={chapterId} bookId={bookId}
        headingNumber={num} isReviewOpen={isReviewOpen}
        onOpenReview={() => setIsReviewOpen(true)}
        onCloseReview={() => setIsReviewOpen(false)}
      />

      {!ed.isFocusMode && <EditorFooter wordCount={ed.wordCount} readingTime={ed.readingTime} viewMode={ed.viewMode} />}
      <EditorModals
        isNewOpen={ed.isNewChapterModalOpen} onCloseNew={() => ed.setIsNewChapterModalOpen(false)} onCreateNew={ed.handleQuickCreateChapter}
        isDeleteOpen={ed.isDeleteModalOpen} onCloseDelete={() => { ed.setIsDeleteModalOpen(false); ed.setChapterToDelete(null); }}
        onConfirmDelete={ed.handleDeleteChapter} chapterTitle={ed.chapterToDelete?.title || ed.title}
        isSettingsOpen={ed.isSettingsModalOpen} onCloseSettings={() => ed.setIsSettingsModalOpen(false)} book={ed.book} formats={ed.formats} fonts={ed.fonts} onSaveSettings={ed.handleUpdateBook}
      />
    </div>
  );
}
