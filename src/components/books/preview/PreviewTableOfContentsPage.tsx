import React from "react";
import type { PreviewChapter } from "@/types/preview";

export interface TocChapterEntry {
  chapter: PreviewChapter;
  startPage: number;
}

interface Props {
  entries: TocChapterEntry[];
  onSelectPage?: (page: number) => void;
}

export function PreviewTableOfContentsPage({ entries, onSelectPage }: Props) {
  return (
    <div className="h-full flex flex-col pt-8 pb-6 px-4 select-text">
      <h2 className="font-serif text-2xl font-normal text-center text-ink tracking-tight mb-8 uppercase">
        Sumário
      </h2>
      <div className="flex-1 overflow-y-auto space-y-3 font-serif pr-1">
        {entries.map(({ chapter, startPage }) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelectPage?.(startPage)}
            className="w-full flex items-baseline justify-between text-sm group hover:text-primary transition-colors cursor-pointer text-left"
          >
            <span className="text-ink group-hover:text-primary truncate max-w-[80%] transition-colors">
              {chapter.number ? `${chapter.number} · ${chapter.title}` : chapter.title}
            </span>
            <span className="flex-1 border-b border-dotted border-ink/30 group-hover:border-primary/50 mx-2 transition-colors" />
            <span className="text-ink/80 group-hover:text-primary text-xs tabular-nums transition-colors">
              {startPage}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
