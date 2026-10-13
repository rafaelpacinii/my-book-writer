"use client";

import React from "react";
import { ReviewDrawerHeader } from "./ReviewDrawerHeader";
import { ReviewProgressCard } from "./ReviewProgressCard";
import { NewCommentForm } from "./NewCommentForm";
import { ReviewFilterTabs } from "./ReviewFilterTabs";
import { ReviewCommentList } from "./ReviewCommentList";
import type { ReviewDrawerProps } from "./types";

export function ReviewDrawer(props: ReviewDrawerProps) {
  const {
    isOpen, onClose, needsRecheck, onToggleNeedsRecheck,
    filter, onFilterChange, comments, totalCommentsCount,
    openCommentsCount, resolvedCommentsCount, onAddComment,
    isSubmitting, onResolveComment, onReopenComment,
    onEditComment, onDeleteComment, pendingExcerpt, onClearPendingExcerpt,
  } = props;

  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 border-l border-border bg-surface flex flex-col shrink-0 h-full z-20">
      <ReviewDrawerHeader openCommentsCount={openCommentsCount} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <ReviewProgressCard needsRecheck={needsRecheck} onToggle={onToggleNeedsRecheck} />

        <NewCommentForm
          onSubmit={onAddComment}
          isSubmitting={isSubmitting}
          pendingExcerpt={pendingExcerpt}
          onClearPendingExcerpt={onClearPendingExcerpt}
        />

        <ReviewFilterTabs
          currentFilter={filter}
          onSelect={onFilterChange}
          counts={{ all: totalCommentsCount, open: openCommentsCount, resolved: resolvedCommentsCount }}
        />

        <ReviewCommentList
          comments={comments}
          onResolve={onResolveComment}
          onReopen={onReopenComment}
          onEdit={onEditComment}
          onDelete={onDeleteComment}
        />
      </div>
    </aside>
  );
}
