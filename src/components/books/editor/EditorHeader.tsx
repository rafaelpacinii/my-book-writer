import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { EditorHeaderActions } from "./EditorHeaderActions";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  bookId: string;
  bookTitle?: string;
  chapterNumber: string;
  saveStatus: SaveStatus;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onSave: () => void;
  onDeleteClick: () => void;
  onToggleDrawer: () => void;
}

export function EditorHeader({
  bookId, bookTitle, chapterNumber, saveStatus, isFocusMode,
  onToggleFocus, onSave, onDeleteClick, onToggleDrawer,
}: Props) {
  return (
    <header className="flex items-center justify-between py-3 border-b border-border/70 select-none">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleDrawer}
          className="p-1.5 text-muted hover:text-foreground hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
          title="Sumário de capítulos"
        >
          <BookOpen className="w-4 h-4 text-primary" />
        </button>
        <span className="text-border">/</span>
        <Link
          href={`/books/view?bookId=${encodeURIComponent(bookId)}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Visão geral</span>
        </Link>
        <span className="text-border">/</span>
        <div className="text-xs text-muted truncate max-w-36 sm:max-w-xs">
          <span className="font-bold text-foreground">{chapterNumber}</span>
          {bookTitle && <span className="text-muted/70"> · {bookTitle}</span>}
        </div>
      </div>

      <EditorHeaderActions
        saveStatus={saveStatus}
        isFocusMode={isFocusMode}
        onToggleFocus={onToggleFocus}
        onSave={onSave}
        onDeleteClick={onDeleteClick}
      />
    </header>
  );
}
