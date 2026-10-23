"use client";

import { ReviewDrawerHeader } from "@/components/books/editor/review/ReviewDrawerHeader";
import { ReviewProgressCard } from "@/components/books/editor/review/ReviewProgressCard";
import { NewCommentForm } from "@/components/books/editor/review/NewCommentForm";
import { ReviewFilterTabs } from "@/components/books/editor/review/ReviewFilterTabs";
import { ReviewCommentList } from "@/components/books/editor/review/ReviewCommentList";
import { ReviewDeleteDialog } from "@/components/books/editor/review/ReviewDeleteDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import type { ReviewController } from "@/components/books/editor/review/types";
import styles from "@/components/books/editor/review/review.module.css";

export function ReviewDrawer({ review, onClose }: { review: ReviewController; onClose: () => void }) {
  return (
    <aside aria-label="Revisão do capítulo" className={styles.drawer}>
      <ReviewDrawerHeader openCommentsCount={review.openCommentsCount} onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {review.error ? <ErrorState message={review.error} onRetry={() => void review.reload()} /> : (
          <LoadingRegion isLoading={review.isLoading} label="Carregando revisão"
            skeleton={<div className="h-40 rounded-xl bg-surface-hover" />}>
            <div className="flex flex-col gap-4">
              <ReviewProgressCard review={review} />
              {review.actionError && (
                <div role="alert" className="rounded-lg border border-danger p-3 text-xs text-danger">
                  <p>{review.actionError}</p>
                  <button type="button" onClick={review.clearError} className="mt-2 underline">Fechar aviso</button>
                </div>
              )}
              <NewCommentForm review={review} />
              <ReviewFilterTabs currentFilter={review.filter} onSelect={review.setFilter}
                counts={{ all: review.comments.length, open: review.openCommentsCount, resolved: review.resolvedCommentsCount }} />
              <ReviewCommentList review={review} onShowText={onClose} />
            </div>
          </LoadingRegion>
        )}
      </div>
      <ReviewDeleteDialog review={review} />
    </aside>
  );
}
