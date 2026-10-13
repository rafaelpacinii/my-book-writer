"use client";

import React from "react";
import { useChapterDragDrop } from "@/hooks/useChapterDragDrop";
import { EditorSidebarCollapsed } from "./EditorSidebarCollapsed";
import { EditorSidebarHeader } from "./EditorSidebarHeader";
import { EditorSidebarItem } from "./EditorSidebarItem";
import { formatChapterBadge } from "@/utils/chapterType";
import type { EditorSidebarProps } from "./editorSidebarTypes";

export function EditorSidebar(p: EditorSidebarProps) {
  const dnd = useChapterDragDrop(p.onReorderChapters);
  if (!p.isOpen) return <EditorSidebarCollapsed onToggleOpen={p.onToggleOpen} />;

  return (
    <aside className="w-[244px] h-full shrink-0 border-r border-border bg-surface flex flex-col justify-between py-4 px-3 select-none">
      <div className="flex-1 flex flex-col min-h-0">
        <EditorSidebarHeader onToggleOpen={p.onToggleOpen} />
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {p.chapters.map((chap, idx) => {
            const standardIndex = p.chapters
              .slice(0, idx)
              .filter((c) => (c.chapter_type || "standard") === "standard").length;
            const badge = formatChapterBadge(chap, idx, standardIndex).badge;
            return (
              <EditorSidebarItem
                key={chap.id}
                id={chap.id}
                badge={badge}
                title={chap.title}
                isActive={chap.id === p.currentChapterId}
                isDragging={dnd.draggedIndex === idx}
                isDragOver={dnd.dragOverIndex === idx}
                onClick={() => p.onSelectChapter(chap.id)}
                onDeleteClick={p.onDeleteChapter ? () => p.onDeleteChapter?.(chap) : undefined}
                onDragStart={(e) => dnd.handleDragStart(e, idx)}
                onDragOver={(e) => dnd.handleDragOver(e, idx)}
                onDragLeave={dnd.handleDragLeave}
                onDrop={(e) => dnd.handleDrop(e, idx)}
                onDragEnd={dnd.handleDragEnd}
              />
            );
          })}
        </div>
      </div>
      <div className="pt-3 border-t border-border mt-2">
        <button
          type="button"
          onClick={p.onNewChapterClick}
          className="w-full h-11 rounded-lg border border-control-border bg-surface hover:bg-surface-hover text-[13px] font-bold text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          + Novo capítulo
        </button>
      </div>
    </aside>
  );
}
