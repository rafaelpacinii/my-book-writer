"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { highlightAndScrollToExcerpt } from "@/lib/editor/reviewHighlight";
import { parseReviewAnchor } from "@/utils/reviewAnchors";
import type { ReviewComment } from "@/types/review";

export function ReviewCommentExcerpt({ comment, onShowText }: { comment: ReviewComment; onShowText: () => void }) {
  const [missing, setMissing] = useState(false);
  if (comment.original_excerpt === "Capítulo" && !parseReviewAnchor(comment.anchor_json)) {
    return <p className="text-xs text-muted">Sobre o capítulo</p>;
  }
  const removed = comment.anchor_state === "removed" || missing;
  const locate = () => {
    const found = highlightAndScrollToExcerpt(comment.original_excerpt, ".editor-content", 1500, parseReviewAnchor(comment.anchor_json));
    setMissing(!found);
    if (found && window.matchMedia("(max-width: 1000px)").matches) onShowText();
  };
  return (
    <div className="rounded-lg border-l-2 border-primary bg-surface-hover p-2 text-xs text-muted">
      <button type="button" disabled={removed} onClick={locate}
        title={removed ? "Trecho removido ou alterado" : "Clique para ir até este trecho no texto"}
        className="flex w-full items-start gap-2 text-left hover:text-foreground disabled:cursor-default">
        <Quote aria-hidden="true" className="h-3 w-3 mt-0.5 shrink-0" />
        <span className="line-clamp-3 italic">&ldquo;{comment.original_excerpt}&rdquo;</span>
      </button>
      {removed && <p role={missing ? "status" : undefined} className="mt-2">Trecho removido ou alterado. A anotação foi preservada.</p>}
    </div>
  );
}
