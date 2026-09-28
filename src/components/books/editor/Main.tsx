"use client";

import React from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { EditorSidebar } from "./EditorSidebar";
import { EditorSheet } from "./EditorSheet";
import { EditorFooter } from "./EditorFooter";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorNotFound } from "./EditorNotFound";
import { EditorModals } from "./EditorModals";
import { useChapterEditor } from "./useChapterEditor";

interface Props {
  bookId: string;
  chapterId: string;
}

export function Main({ bookId, chapterId }: Props) {
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
            fontFamily={ed.book?.font_preset_id || "Merriweather"} fontSizePt={ed.book?.font_size_pt}
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
        <EditorSheet
          chapterNumber={num} title={ed.title} onTitleChange={ed.setTitle}
          contentRef={ed.contentRef} initialContent={ed.text} onContentChange={ed.setText}
          fontSizePt={ed.book?.font_size_pt} lineHeightRatio={ed.book?.line_height_ratio}
          onSelectionChange={ed.updateActiveStyles} bookId={bookId}
          prevChapter={ed.prevChapter} nextChapter={ed.nextChapter}
          isFocusMode={ed.isFocusMode} onExitFocus={() => ed.setIsFocusMode(false)}
        />
      </div>

      {!ed.isFocusMode && <EditorFooter wordCount={ed.wordCount} readingTime={ed.readingTime} />}
      <EditorModals
        isNewOpen={ed.isNewChapterModalOpen} onCloseNew={() => ed.setIsNewChapterModalOpen(false)} onCreateNew={ed.handleQuickCreateChapter}
        isDeleteOpen={ed.isDeleteModalOpen} onCloseDelete={() => ed.setIsDeleteModalOpen(false)} onConfirmDelete={ed.handleDeleteChapter} chapterTitle={ed.title}
      />
    </div>
  );
}
