import type React from "react";
import type { ChapterSummary } from "@/types/chapter";

export interface EditorSidebarProps {
  chapters: ChapterSummary[];
  currentChapterId: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectChapter: (id: string) => void;
  onDeleteChapter?: (chapter: ChapterSummary) => void;
  onNewChapterClick: () => void;
  onReorderChapters: (sourceIndex: number, targetIndex: number) => void;
}

export interface EditorSidebarItemProps {
  id: string;
  badge: string;
  title: string;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onClick: () => void;
  onDeleteClick?: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

