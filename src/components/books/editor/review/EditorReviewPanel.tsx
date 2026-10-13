"use client";

import React from "react";
import { ReviewDrawer } from "./ReviewDrawer";
import type { useReview } from "@/hooks/useReview";

interface Props {
  rev: ReturnType<typeof useReview>;
  isOpen: boolean;
  onClose: () => void;
  pendingExcerpt?: string;
  onClearPendingExcerpt?: () => void;
}

export function EditorReviewPanel(props: Props) {
  const { rev, isOpen, onClose, pendingExcerpt, onClearPendingExcerpt } = props;

  return (
    <ReviewDrawer
      isOpen={isOpen}
      onClose={onClose}
      needsRecheck={rev.needsRecheck}
      onToggleNeedsRecheck={rev.toggleNeedsRecheck}
      filter={rev.filter}
      onFilterChange={rev.setFilter}
      comments={rev.filteredComments}
      totalCommentsCount={rev.comments.length}
      openCommentsCount={rev.openCommentsCount}
      resolvedCommentsCount={rev.resolvedCommentsCount}
      onAddComment={rev.addComment}
      isSubmitting={rev.isSubmitting}
      onResolveComment={rev.resolveComment}
      onReopenComment={rev.reopenComment}
      onEditComment={rev.editComment}
      onDeleteComment={rev.deleteComment}
      pendingExcerpt={pendingExcerpt}
      onClearPendingExcerpt={onClearPendingExcerpt}
    />
  );
}
