"use client";

import { formatLastEdited } from "@/utils/format";
import { versionDate } from "@/utils/versionHistory";
import { ReviewCommentExcerpt } from "@/components/books/editor/review/ReviewCommentExcerpt";
import { ReviewCommentCardFooter } from "@/components/books/editor/review/ReviewCommentCardFooter";
import { ReviewCommentEditForm } from "@/components/books/editor/review/ReviewCommentEditForm";
import type { ReviewCommentCardProps } from "@/components/books/editor/review/types";

export function ReviewCommentCard({ comment, review, onShowText }: ReviewCommentCardProps) {
  const edit = review.draft.edits[comment.id];
  return (
    <article aria-label="Comentário de revisão"
      className="p-3.5 rounded-xl border border-border bg-surface flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-foreground">Anotação</span>
        <time dateTime={versionDate(comment.created_at).toISOString()} className="text-xs text-muted">
          {formatLastEdited(versionDate(comment.created_at).toISOString())}
        </time>
      </div>
      <ReviewCommentExcerpt comment={comment} onShowText={onShowText} />
      {edit !== undefined ? (
        <ReviewCommentEditForm text={edit} onChange={(text) => review.editDraft(comment.id, text)}
          isSaving={review.isPending} onSave={() => void review.editComment(comment.id, edit)}
          onCancel={() => review.editDraft(comment.id, null)} />
      ) : (
        <>
          <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{comment.body}</p>
          <ReviewCommentCardFooter isResolved={comment.status === "resolved"} disabled={review.isPending}
            onResolve={() => void review.resolveComment(comment.id)} onReopen={() => void review.reopenComment(comment.id)}
            onEdit={() => review.editDraft(comment.id, comment.body)} onDelete={() => review.requestDelete(comment)} />
        </>
      )}
    </article>
  );
}
