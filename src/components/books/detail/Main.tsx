"use client";

import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { BookDetailHeader } from "./BookDetailHeader";
import { ChaptersSectionHeader } from "./ChaptersSectionHeader";
import { ChaptersGrid } from "./ChaptersGrid";
import { ChapterModals } from "./ChapterModals";
import { DetailSkeleton } from "./DetailSkeleton";
import { DetailNotFound } from "./DetailNotFound";
import { useBookDetail } from "./useBookDetail";

interface Props {
  bookId: string;
}

export function Main({ bookId }: Props) {
  const d = useBookDetail(bookId);

  if (d.isLoading && !d.book) return <DetailSkeleton />;
  if (!d.book) return <DetailNotFound />;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16">
        <BookDetailHeader book={d.book} formatName={d.formatName} fontName={d.fontName} />
        <ChaptersSectionHeader chaptersCount={d.chapters.length} />
        <ChaptersGrid
          chapters={d.chapters}
          bookId={bookId}
          onNewChapter={() => d.setIsModalOpen(true)}
          onRename={d.setChapterToRename}
          onDelete={d.setChapterToDelete}
          onMoveUp={(idx) => d.handleMoveChapter(idx, "up")}
          onMoveDown={(idx) => d.handleMoveChapter(idx, "down")}
          onDropReorder={d.handleDropReorder}
        />
        <ChapterModals
          isNewOpen={d.isModalOpen}
          onNewClose={() => d.setIsModalOpen(false)}
          onNewCreate={d.handleCreateChapter}
          chapterToRename={d.chapterToRename}
          onRenameClose={() => d.setChapterToRename(null)}
          onRenameConfirm={d.handleConfirmRename}
          chapterToDelete={d.chapterToDelete}
          onDeleteClose={() => d.setChapterToDelete(null)}
          onDeleteConfirm={d.handleConfirmDelete}
        />
      </div>
    </AppShell>
  );
}
