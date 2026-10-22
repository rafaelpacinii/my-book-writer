export interface EditorActionProps {
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
