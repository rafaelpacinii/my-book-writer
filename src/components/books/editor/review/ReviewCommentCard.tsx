"use client";

import React, { useState } from "react";
import { Quote } from "lucide-react";
import { formatLastEdited } from "@/utils/format";
import { highlightAndScrollToExcerpt } from "@/utils/editorHighlight";
import { ReviewCommentCardFooter } from "./ReviewCommentCardFooter";
import { ReviewCommentEditForm } from "./ReviewCommentEditForm";
import type { ReviewCommentCardProps } from "./types";

export function ReviewCommentCard(props: ReviewCommentCardProps) {
  const { comment, onResolve, onReopen, onEdit, onDelete } = props;
  const [isEditing, setIsEditing] = useState(false);
  const isResolved = comment.status === "resolved";
  const hasExcerpt = Boolean(comment.original_excerpt && comment.original_excerpt !== "Capítulo");

  return (
    <div className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-colors ${
      isResolved ? "bg-surface-hover/30 border-border/60 opacity-75" : "bg-surface border-border hover:border-primary/40 shadow-xs"
    }`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-foreground">Anotação</span>
        <span className="text-[11px] text-muted">{formatLastEdited(comment.created_at)}</span>
      </div>

      {hasExcerpt && (
        <button
          type="button"
          onClick={() => highlightAndScrollToExcerpt(comment.original_excerpt)}
          className="flex items-start text-left gap-1.5 p-2 rounded-lg bg-surface-hover/80 hover:bg-surface-hover border-l-2 border-primary text-xs text-muted hover:text-foreground italic line-clamp-3 transition-colors cursor-pointer group/excerpt"
          title="Clique para ir até este trecho no texto"
        >
          <Quote className="w-3 h-3 text-primary shrink-0 mt-0.5 group-hover/excerpt:scale-110 transition-transform" />
          <span className="truncate">&ldquo;{comment.original_excerpt}&rdquo;</span>
        </button>
      )}

      {isEditing ? (
        <ReviewCommentEditForm
          initialText={comment.body}
          onSave={async (newText) => {
            await onEdit(newText);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{comment.body}</p>
          <ReviewCommentCardFooter
            isResolved={isResolved}
            onResolve={onResolve}
            onReopen={onReopen}
            onEdit={() => setIsEditing(true)}
            onDelete={onDelete}
          />
        </>
      )}
    </div>
  );
}
