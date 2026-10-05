"use client";

import React from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { EditorSidebar } from "./EditorSidebar";
import { EditorCanvasSwitcher } from "./EditorCanvasSwitcher";
import { EditorFooter } from "./EditorFooter";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorNotFound } from "./EditorNotFound";
import { EditorModals } from "./EditorModals";
import { useChapterEditor } from "./useChapterEditor";

export function Main({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const ed = useChapterEditor(bookId, chapterId);
  const num = `Capítulo ${String(ed.currentIndex + 1).padStart(2, "0")}`;

  if (ed.isLoading && !ed.chapter) return <EditorSkeleton />;
  if (!ed.chapter) return <EditorNotFound bookId={bookId} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {!ed.isFocusMode && (
        <>
          <EditorHeader
            bookId={bookId} bookTitle={ed.book?.title} chapterNumber={num} chapterTitle={ed.title}
            saveStatus={ed.saveStatus} isFocusMode={ed.isFocusMode} isSidebarOpen={ed.isDrawerOpen}
            onToggleSidebar={() => ed.setIsDrawerOpen(!ed.isDrawerOpen)} onToggleFocus={() => ed.setIsFocusMode(true)}
            onSave={ed.saveNow} onDeleteClick={() => ed.setIsDeleteModalOpen(true)}
          />
          <EditorToolbar
            onFormat={ed.handleFormat} onUndo={ed.handleUndo} onRedo={ed.handleRedo}
            isBold={ed.isBold} isItalic={ed.isItalic} isUnderline={ed.isUnderline}
            fontFamily={ed.bookFont?.family_name} fontSizePt={ed.book?.font_size_pt}
            viewMode={ed.viewMode} onViewModeChange={ed.setViewMode}
          />
        </>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!ed.isFocusMode && ed.isDrawerOpen && (
          <EditorSidebar
            chapters={ed.chapters} currentChapterId={chapterId}
            onSelectChapter={ed.handleSelectChapter} onNewChapterClick={() => ed.setIsNewChapterModalOpen(true)}
          />
        )}
        <EditorCanvasSwitcher
          viewMode={ed.viewMode} book={ed.book} format={ed.bookFormat} font={ed.bookFont}
          bookId={bookId} chapterNumber={num}
          title={ed.title} onTitleChange={ed.setTitle} contentRef={ed.contentRef}
          text={ed.text} onTextChange={ed.setText} onSelectionChange={ed.updateActiveStyles}
          prevChapter={ed.prevChapter} nextChapter={ed.nextChapter}
          isFocusMode={ed.isFocusMode} onExitFocus={() => ed.setIsFocusMode(false)}
          isFitMode={ed.isFitMode} onFitModeChange={ed.setIsFitMode}
        />
      </div>

      {!ed.isFocusMode && (
        <EditorFooter
          wordCount={ed.wordCount} readingTime={ed.readingTime} viewMode={ed.viewMode}
        />
      )}
      <EditorModals
        isNewOpen={ed.isNewChapterModalOpen} onCloseNew={() => ed.setIsNewChapterModalOpen(false)} onCreateNew={ed.handleQuickCreateChapter}
        isDeleteOpen={ed.isDeleteModalOpen} onCloseDelete={() => ed.setIsDeleteModalOpen(false)} onConfirmDelete={ed.handleDeleteChapter} chapterTitle={ed.title}
      />
    </div>
  );
}
