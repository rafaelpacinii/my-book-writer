import React from "react";
import Link from "next/link";
import type { ChapterSummary } from "@/types/chapter";
import { formatLastEdited } from "@/utils/format";
import { ChapterCardHeader } from "./ChapterCardHeader";

interface Props {
  chapter: ChapterSummary;
  bookId: string;
  index: number;
  totalChapters: number;
  onRename: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function ChapterCard(props: Props) {
  const { chapter, bookId, index, totalChapters, onRename, onDelete, onMoveUp, onMoveDown } = props;
  const { isDragging, isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd } = props;
  const chapterNumber = String(index + 1).padStart(2, "0");

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

      <div className="border-t border-border/70 pt-3 mt-4">
        <p className="text-xs text-muted">
          Última edição {formatLastEdited(chapter.updated_at)}
        </p>
      </div>
    </Link>
  );
}
