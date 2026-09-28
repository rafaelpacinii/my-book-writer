"use client";

import React from "react";
import { Plus, X, BookOpen } from "lucide-react";
import { DrawerChapterItem } from "./DrawerChapterItem";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterSummary[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onNewChapterClick: () => void;
}

export function EditorDrawer({
  isOpen, onClose, chapters, currentChapterId, onSelectChapter, onNewChapterClick,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <aside className="relative w-80 max-w-[85vw] h-full bg-surface border-r border-border shadow-2xl flex flex-col z-50">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Sumário do livro</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-muted hover:text-foreground rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {chapters.map((chap, idx) => (
            <DrawerChapterItem
              key={chap.id}
              chapter={chap}
              index={idx}
              isActive={chap.id === currentChapterId}
              onSelect={(id) => {
                onSelectChapter(id);
                onClose();
              }}
            />
          ))}
        </div>

        <div className="p-3 border-t border-border bg-surface">
          <button
            type="button"
            onClick={onNewChapterClick}
            className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-dashed border-border hover:border-primary text-xs font-bold text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo capítulo</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
