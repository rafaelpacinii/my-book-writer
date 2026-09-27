import React from "react";
import Link from "next/link";
import type { ChapterSummary } from "@/types/chapter";
import { formatLastEdited } from "@/utils/format";

interface Props {
  chapter: ChapterSummary;
  bookId: string;
  index: number;
}

export function ChapterCard({ chapter, bookId, index }: Props) {
  const chapterNumber = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapter.id)}`}
      className="flex flex-col justify-between p-6 sm:p-7 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all shadow-xs group cursor-pointer min-h-52"
    >
      <div>
        <span className="font-serif text-3xl font-light text-primary/70 group-hover:text-primary transition-colors">
          {chapterNumber}
        </span>
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mt-2 line-clamp-2">
          {chapter.title}
        </h3>
      </div>

      <div className="border-t border-border/70 pt-3 mt-4">
        <p className="text-xs text-muted">
          Última edição {formatLastEdited(chapter.updated_at)}
        </p>
      </div>
    </Link>
  );
}
