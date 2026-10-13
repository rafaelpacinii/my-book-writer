import type { ReviewComment } from "@/types/review";
import type { ReviewFilter } from "@/hooks/useReview";

export interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  needsRecheck: boolean;
  onToggleNeedsRecheck: () => void;
  filter: ReviewFilter;
  onFilterChange: (f: ReviewFilter) => void;
  comments: ReviewComment[];
  totalCommentsCount: number;
  openCommentsCount: number;
  resolvedCommentsCount: number;
  onAddComment: (body: string, excerpt?: string) => Promise<unknown>;
  isSubmitting: boolean;
  onResolveComment: (id: string) => void;
  onReopenComment: (id: string) => void;
  onEditComment: (id: string, body: string) => Promise<void> | void;
  onDeleteComment: (id: string) => Promise<void> | void;
  pendingExcerpt?: string;
  onClearPendingExcerpt?: () => void;
}

export interface NewCommentFormProps {
  onSubmit: (body: string, excerpt?: string) => Promise<unknown>;
  isSubmitting: boolean;
  pendingExcerpt?: string;
  onClearPendingExcerpt?: () => void;
}

export interface ReviewCommentCardProps {
  comment: ReviewComment;
  onResolve: () => void;
  onReopen: () => void;
  onEdit: (body: string) => Promise<void> | void;
  onDelete: () => void;
}
