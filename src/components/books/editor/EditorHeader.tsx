import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorHeaderActions } from "./EditorHeaderActions";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  bookId: string;
  bookTitle?: string;
  chapterNumber: string;
  chapterTitle: string;
  saveStatus: SaveStatus;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onSave: () => void;
  onDeleteClick: () => void;
  onExport: () => void;
  isOpeningExport: boolean;
}

export function EditorHeader({
  bookId,
  bookTitle,
  chapterNumber,
  chapterTitle,
  saveStatus,
  isFocusMode,
  onToggleFocus,
  onSave,
  onDeleteClick,
  onExport,
  isOpeningExport,
}: Props) {
  return (
    <header className="h-[72px] px-6 border-b border-border bg-surface flex items-center justify-between select-none shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href={`/books/view?bookId=${encodeURIComponent(bookId)}`}
          className="text-foreground hover:text-primary transition-colors cursor-pointer"
          title="Voltar ao menu do livro"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-foreground truncate">
            {bookTitle || "Sem título"}
          </span>
          <span className="text-xs text-muted truncate">
            {chapterNumber} · {chapterTitle || "Sem título"}
          </span>
        </div>
      </div>

      <EditorHeaderActions
        saveStatus={saveStatus}
        isFocusMode={isFocusMode}
        onToggleFocus={onToggleFocus}
        onSave={onSave}
        onDeleteClick={onDeleteClick}
        onExport={onExport}
        isOpeningExport={isOpeningExport}
      />
    </header>
  );
}
