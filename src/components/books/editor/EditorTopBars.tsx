"use client";

import React from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import type { MainEditorState } from "./mainTypes";

export function EditorTopBars({ state, bookId }: { state: MainEditorState; bookId: string }) {
  const { ed, rev, ver, headingNumber, isReviewOpen, setIsReviewOpen, isVersionOpen, setIsVersionOpen } = state;
  if (ed.isFocusMode) return null;

  return (
    <>
      <EditorHeader
        bookId={bookId} bookTitle={ed.book?.title} chapterNumber={headingNumber} chapterTitle={ed.title}
        saveStatus={ed.saveStatus} isFocusMode={ed.isFocusMode} onToggleFocus={() => ed.setIsFocusMode(true)}
        onSave={ed.saveNow} isReviewOpen={isReviewOpen}
        onToggleReview={() => { setIsReviewOpen(!isReviewOpen); if (!isReviewOpen) setIsVersionOpen(false); }}
        openCommentsCount={rev.openCommentsCount} needsRecheck={rev.needsRecheck}
        isVersionOpen={isVersionOpen}
        onToggleVersion={() => { setIsVersionOpen(!isVersionOpen); if (!isVersionOpen) setIsReviewOpen(false); }}
        versionsCount={ver.versions.length}
      />
      <EditorToolbar
        onFormat={ed.handleFormat} onUndo={ed.handleUndo} onRedo={ed.handleRedo}
        isBold={ed.isBold} isItalic={ed.isItalic} isUnderline={ed.isUnderline}
        fonts={ed.fonts} currentFontId={ed.book?.font_preset_id} onSelectFont={ed.handleUpdateFont}
        fontSizePt={ed.book?.font_size_pt} onSelectFontSize={ed.handleUpdateFontSize}
        onOpenSettings={() => ed.setIsSettingsModalOpen(true)} viewMode={ed.viewMode} onViewModeChange={ed.setViewMode}
      />
    </>
  );
}

