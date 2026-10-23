"use client";

import { useId } from "react";
import { Plus, Quote, X } from "lucide-react";
import { captureReviewAnchor } from "@/lib/editor/reviewSelection";
import { useReviewFormFocus } from "@/hooks/useReviewFormFocus";
import type { ReviewController } from "@/components/books/editor/review/types";

export function NewCommentForm({ review }: { review: ReviewController }) {
  const id = useId();
  const { draft, updateDraft } = review;
  const textareaRef = useReviewFormFocus(draft.anchor);
  return (
    <form onSubmit={(event) => { event.preventDefault(); void review.addComment(); }}
      className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-foreground">Novo comentário</label>
        <button type="button" disabled={review.isPending}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => { const anchor = captureReviewAnchor(); if (anchor) updateDraft({ anchor }); }}
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1">
          <Quote aria-hidden="true" className="w-3 h-3" /> Capturar
        </button>
      </div>
      {draft.anchor && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-surface-hover text-xs text-muted">
          <span className="line-clamp-3 italic">&ldquo;{draft.anchor.quote}&rdquo;</span>
          <button type="button" aria-label="Remover trecho selecionado"
            onClick={() => updateDraft({ anchor: null })} className="shrink-0 p-1 text-muted hover:text-danger">
            <X aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
      )}
      <textarea id={id} ref={textareaRef} value={draft.body}
        onChange={(event) => updateDraft({ body: event.target.value })}
        placeholder="Escreva sua anotação ou sugestão..." rows={3}
        className="w-full text-xs p-2 rounded-lg border border-control-border bg-background text-foreground placeholder:text-muted focus:outline-hidden focus:border-primary resize-y" />
      <p className="text-xs text-muted">{draft.anchor ? "Comentário sobre o trecho selecionado." : "Anotação sobre o capítulo inteiro."}</p>
      <button type="submit" disabled={!draft.body.trim() || review.isPending}
        className="self-end px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-primary-hover disabled:opacity-50">
        <Plus aria-hidden="true" className="w-3.5 h-3.5" />
        {review.isPending ? "Salvando..." : "Comentar"}
      </button>
    </form>
  );
}
