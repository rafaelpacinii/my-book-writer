"use client";

import React from "react";
import { EditorTopBars } from "./EditorTopBars";
import { EditorWorkspace } from "./EditorWorkspace";
import { EditorFooter } from "./EditorFooter";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorNotFound } from "./EditorNotFound";
import { EditorModals } from "./EditorModals";
import { useMainEditorState } from "./useMainEditorState";
import type { MainProps } from "./mainTypes";
import { useSaveBeforeNavigation } from "@/hooks/useSaveBeforeNavigation";
import styles from "./editorChrome.module.css";

export function Main({ bookId, chapterId }: MainProps) {
  const state = useMainEditorState(bookId, chapterId);
  const { ed, rev, ver } = state;
  useSaveBeforeNavigation(Boolean(ed.chapter), ed.saveNow);

  if (ed.isLoading && !ed.chapter) return <EditorSkeleton />;
  if (!ed.chapter) return <EditorNotFound bookId={bookId} />;

  return (
    <div data-editor-focus={ed.isFocusMode} className={`${styles.workspace} flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground`}>
      <EditorTopBars state={state} bookId={bookId} />
      <EditorWorkspace
        ed={ed} rev={rev} ver={ver} chapterId={chapterId} bookId={bookId}
        headingNumber={state.headingNumber} isReviewOpen={state.isReviewOpen}
        onOpenReview={() => { state.setIsReviewOpen(true); state.setIsVersionOpen(false); }}
        onCloseReview={() => state.setIsReviewOpen(false)}
        isVersionOpen={state.isVersionOpen}
        onCloseVersion={() => state.setIsVersionOpen(false)}
      />
      <EditorFooter wordCount={ed.wordCount} readingTime={ed.readingTime} viewMode={ed.viewMode}
        onViewModeChange={ed.setViewMode} saveStatus={ed.saveStatus} autosaveEnabled={ed.preferences.autosaveEnabled}
        onSave={ed.saveNow} isFocusMode={ed.isFocusMode} />
      <EditorModals
        isNewOpen={ed.isNewChapterModalOpen} onCloseNew={() => ed.setIsNewChapterModalOpen(false)} onCreateNew={ed.handleQuickCreateChapter}
        isDeleteOpen={ed.isDeleteModalOpen} onCloseDelete={() => { ed.setIsDeleteModalOpen(false); ed.setChapterToDelete(null); }}
        onConfirmDelete={ed.handleDeleteChapter} chapterTitle={ed.chapterToDelete?.title || ed.title}
        isSettingsOpen={ed.isSettingsModalOpen} onCloseSettings={() => ed.setIsSettingsModalOpen(false)} book={ed.book} formats={ed.formats} fonts={ed.fonts} onSaveSettings={ed.handleUpdateBook}
      />
    </div>
  );
}
