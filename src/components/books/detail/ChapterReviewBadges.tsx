import { AlertCircle, MessageSquare } from "lucide-react";
import type { useChapterReviewStatus } from "@/hooks/useChapterReviewStatus";

export function ChapterReviewBadges({ review }: { review: ReturnType<typeof useChapterReviewStatus> }) {
  if (review.isLoading) return <span role="status" className="sr-only">Carregando revisão</span>;
  if (review.error) return (
    <button type="button" title={review.error} aria-label="Recarregar revisão do capítulo"
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); void review.retry(); }}
      className="text-xs text-danger underline">Revisão indisponível</button>
  );
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {review.openCommentsCount > 0 && (
        <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-primary-soft text-primary flex items-center gap-1"
          title={`${review.openCommentsCount} comentário(s) em aberto`}>
          <MessageSquare aria-hidden="true" className="w-3 h-3" />{review.openCommentsCount}
        </span>
      )}
      {review.needsRecheck && (
        <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-warning-soft text-warning flex items-center gap-1"
          title="Capítulo sinalizado para revisão">
          <AlertCircle aria-hidden="true" className="w-3 h-3" />Rever
        </span>
      )}
    </div>
  );
}
