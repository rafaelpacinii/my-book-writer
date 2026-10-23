"use client";

import { MessageSquareDashed } from "lucide-react";
import { ReviewCommentCard } from "@/components/books/editor/review/ReviewCommentCard";
import type { ReviewController } from "@/components/books/editor/review/types";

export function ReviewCommentList({ review, onShowText }: { review: ReviewController; onShowText: () => void }) {
  if (!review.filteredComments.length) return (
    <div className="py-8 px-4 text-center flex flex-col items-center gap-2 text-muted">
      <MessageSquareDashed aria-hidden="true" className="w-8 h-8" />
      <p className="text-xs font-medium">Nenhum comentário nesta lista.</p>
      <p className="text-xs">Adicione notas acima para registrar pontos de revisão.</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-3 pb-6">
      {review.filteredComments.map((comment) => (
        <ReviewCommentCard key={comment.id} comment={comment} review={review} onShowText={onShowText} />
      ))}
    </div>
  );
}
