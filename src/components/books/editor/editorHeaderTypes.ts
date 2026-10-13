import type { SaveStatus } from "./useChapterEditor";

export interface EditorHeaderProps {
  bookId: string;
  bookTitle?: string;
  chapterNumber: string;
  chapterTitle: string;
  saveStatus: SaveStatus;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onSave: () => void;
  isReviewOpen?: boolean;
  onToggleReview?: () => void;
  openCommentsCount?: number;
  needsRecheck?: boolean;
  isVersionOpen?: boolean;
  onToggleVersion?: () => void;
  versionsCount?: number;
}
