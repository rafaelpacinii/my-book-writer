import React from "react";
import Link from "next/link";
import { ChapterCardHeader } from "./ChapterCardHeader";
import { ChapterCardFooter } from "./ChapterCardFooter";
import { useChapterReviewStatus } from "@/hooks/useChapterReviewStatus";
import { formatChapterBadge } from "@/utils/chapterType";
import type { ChapterCardProps } from "./chapterCardTypes";

export function ChapterCard(props: ChapterCardProps) {
  const {
    chapter, bookId, index, standardIndex, totalChapters,
    onRename, onDelete, onMoveUp, onMoveDown, isDragging,
    isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
  } = props;
  const { needsRecheck, openCommentsCount } = useChapterReviewStatus(chapter.id);
  const chapterNumber = formatChapterBadge(chapter, index, standardIndex).badge;
  const dragClass = isDragging
    ? "opacity-35 scale-95 border-dashed border-primary"
    : isDragOver
      ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
      : "border-border hover:border-primary/40";

  return (
    <Link
      href={`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapter.id)}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex flex-col justify-between p-6 sm:p-7 rounded-xl bg-surface border transition-all shadow-xs group cursor-grab active:cursor-grabbing min-h-52 relative select-none ${dragClass}`}
    >
      <div>
        <ChapterCardHeader
          chapterNumber={chapterNumber}
          onRename={onRename}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          canMoveUp={index > 0}
          canMoveDown={index < totalChapters - 1}
        />
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mt-2 line-clamp-2">
          {chapter.title}
        </h3>
      </div>

      <ChapterCardFooter
        updatedAt={chapter.updated_at}
        needsRecheck={needsRecheck}
        openCommentsCount={openCommentsCount}
      />
    </Link>
  );
}
