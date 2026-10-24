"use client";

import { EditorHeader } from "./EditorHeader";
import { EditorHeaderActions } from "./EditorHeaderActions";
import { EditorToolbar } from "./EditorToolbar";
import type { MainEditorState } from "./mainTypes";

export function EditorTopBars({ state, bookId }: { state: MainEditorState; bookId: string }) {
  const { ed, rev, ver, isReviewOpen, setIsReviewOpen, isVersionOpen, setIsVersionOpen } = state;
  if (ed.isFocusMode) return null;

  return (
    <EditorHeader>
      <EditorToolbar
        onFormat={ed.handleFormat} onUndo={ed.handleUndo} onRedo={ed.handleRedo}
        isBold={ed.isBold} isItalic={ed.isItalic} isUnderline={ed.isUnderline}
      />
      <EditorHeaderActions
        bookId={bookId} chapterId={ed.chapter?.id || ""}
        onOpenSettings={() => ed.setIsSettingsModalOpen(true)} onToggleFocus={() => ed.setIsFocusMode(true)}
        isReviewOpen={isReviewOpen} onToggleReview={() => setIsReviewOpen(!isReviewOpen)}
        openCommentsCount={rev.openCommentsCount} needsRecheck={rev.needsRecheck}
        isVersionOpen={isVersionOpen} onToggleVersion={() => setIsVersionOpen(!isVersionOpen)}
        versionsCount={ver.versions.length}
      />
    </EditorHeader>
  );
}
