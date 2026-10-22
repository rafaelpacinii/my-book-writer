export interface EditorActionProps {
  bookId: string;
  chapterId: string;
  onOpenSettings: () => void;
  onToggleFocus: () => void;
  isReviewOpen: boolean;
  onToggleReview: () => void;
  openCommentsCount: number;
  needsRecheck: boolean;
  isVersionOpen: boolean;
  onToggleVersion: () => void;
  versionsCount: number;
}
