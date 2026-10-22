import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { EditorSaveIndicator } from "./EditorSaveIndicator";
import { EditorReviewButton } from "./EditorReviewButton";
import { EditorHistoryButton } from "./EditorHistoryButton";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  saveStatus: SaveStatus;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onSave: () => void;
  isReviewOpen?: boolean;
  onToggleReview?: () => void;
  openCommentsCount?: number;
  needsRecheck?: boolean;
  isVersionOpen?: boolean;
  onToggleVersion?: () => void;
  versionsCount?: number;
}

export function EditorHeaderActions(props: Props) {
  const {
    saveStatus, isFocusMode, onToggleFocus,
    isReviewOpen = false, onToggleReview,
    openCommentsCount = 0, needsRecheck = false,
    isVersionOpen = false, onToggleVersion,
    versionsCount = 0,
  } = props;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <EditorSaveIndicator status={saveStatus} />

      {onToggleVersion && (
        <EditorHistoryButton
          isOpen={isVersionOpen}
          onToggle={onToggleVersion}
          count={versionsCount}
        />
      )}

      {onToggleReview && (
        <EditorReviewButton
          isOpen={isReviewOpen}
          onToggle={onToggleReview}
          openCommentsCount={openCommentsCount}
          needsRecheck={needsRecheck}
        />
      )}

      <button
        type="button"
        onClick={onToggleFocus}
        className="h-11 px-5 rounded-lg border border-control-border bg-surface hover:bg-surface-hover text-[13px] font-bold text-foreground transition-colors cursor-pointer flex items-center gap-2"
        title={isFocusMode ? "Sair do modo foco" : "Modo foco"}
      >
        {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        <span>{isFocusMode ? "Sair do foco" : "Modo foco"}</span>
      </button>
    </div>
  );
}
