import React from "react";
import type { ChapterSummary } from "@/types/chapter";
import { NewChapterCard } from "./NewChapterCard";
import { ChapterCard } from "./ChapterCard";
import { EmptyChaptersNotice } from "./EmptyChaptersNotice";
import { useChapterDragDrop } from "./useChapterDragDrop";

interface Props {
  chapters: ChapterSummary[];
  bookId: string;
  onNewChapter: () => void;
  onRename: (chapter: ChapterSummary) => void;
  onDelete: (chapter: ChapterSummary) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDropReorder: (sourceIndex: number, targetIndex: number) => void;
}

export function ChaptersGrid(props: Props) {
  const { chapters, bookId, onNewChapter, onRename, onDelete, onMoveUp, onMoveDown, onDropReorder } = props;
  const dnd = useChapterDragDrop(onDropReorder);
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
            totalChapters={chapters.length}
            onRename={() => onRename(chapter)}
            onDelete={() => onDelete(chapter)}
            onMoveUp={() => onMoveUp(idx)}
            onMoveDown={() => onMoveDown(idx)}
            isDragging={dnd.draggedIndex === idx}
            isDragOver={dnd.dragOverIndex === idx}
            onDragStart={(e) => dnd.handleDragStart(e, idx)}
            onDragOver={(e) => dnd.handleDragOver(e, idx)}
            onDragLeave={dnd.handleDragLeave}
            onDrop={(e) => dnd.handleDrop(e, idx)}
            onDragEnd={dnd.handleDragEnd}
          />
        ))
      )}
    </div>
  );
}
