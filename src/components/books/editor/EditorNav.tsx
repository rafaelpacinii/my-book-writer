import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  bookId: string;
  prevChapter: ChapterSummary | null;
  nextChapter: ChapterSummary | null;
}

export function EditorNav({ bookId, prevChapter, nextChapter }: Props) {
  if (!prevChapter && !nextChapter) return null;

  return (
    <div className="flex items-center justify-between gap-4 py-4 my-2 border-t border-border/40 select-none">
      <div>
        {prevChapter ? (
          <Link
            href={`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(prevChapter.id)}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-muted/70">Anterior</span>
              <span className="truncate max-w-36 sm:max-w-xs block">{prevChapter.title}</span>
            </div>
          </Link>
        ) : <div />}
      </div>

      <div>
        {nextChapter ? (
          <Link
            href={`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(nextChapter.id)}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors group cursor-pointer text-right"
          >
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider text-muted/70">Próximo</span>
              <span className="truncate max-w-36 sm:max-w-xs block">{nextChapter.title}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
