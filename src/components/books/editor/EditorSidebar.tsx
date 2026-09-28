"use client";

import React from "react";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  chapters: ChapterSummary[];
  currentChapterId: string;
  onSelectChapter: (id: string) => void;
  onNewChapterClick: () => void;
}

export function EditorSidebar({
  chapters,
  currentChapterId,
  onSelectChapter,
  onNewChapterClick,
}: Props) {
  return (
    <aside className="w-[244px] h-full shrink-0 border-r border-border bg-surface flex flex-col justify-between py-4 px-3 select-none">
      <div className="flex-1 flex flex-col min-h-0">
        <p className="px-2 pb-3 text-[11px] font-bold tracking-wider text-muted uppercase">
          Capítulos
        </p>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {chapters.map((chap, idx) => {
            const isActive = chap.id === currentChapterId;
            return (
              <button
                type="button"
                key={chap.id}
                onClick={() => onSelectChapter(chap.id)}
                className={`w-full h-16 rounded-lg px-3.5 py-2 flex flex-col justify-center text-left transition-colors cursor-pointer ${isActive ? "bg-primary-soft shadow-2xs" : "bg-transparent hover:bg-surface-hover"
                  }`}
              >
                <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-muted"}`}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-foreground truncate mt-0.5 font-normal">
                  {chap.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border mt-2">
        <button
          type="button"
          onClick={onNewChapterClick}
          className="w-full h-11 rounded-lg border border-control-border bg-surface hover:bg-surface-hover text-[13px] font-bold text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          + Novo capítulo
        </button>
      </div>
    </aside>
  );
}
