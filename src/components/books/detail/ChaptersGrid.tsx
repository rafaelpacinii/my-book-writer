import React from "react";
import type { ChapterSummary } from "@/types/chapter";
import { NewChapterCard } from "./NewChapterCard";
import { ChapterCard } from "./ChapterCard";
import { EmptyChaptersNotice } from "./EmptyChaptersNotice";

interface Props {
  chapters: ChapterSummary[];
  bookId: string;
  onNewChapter: () => void;
}

export function ChaptersGrid({ chapters, bookId, onNewChapter }: Props) {
  const isEmpty = chapters.length === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewChapterCard onClick={onNewChapter} />

      {isEmpty ? (
        <div className="sm:col-span-1 lg:col-span-2">
          <EmptyChaptersNotice />
        </div>
      ) : (
        chapters.map((chapter, idx) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            bookId={bookId}
            index={idx}
          />
        ))
      )}
    </div>
  );
}
