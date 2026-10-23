"use client";

import { CheckCircle2, CircleDashed, AlertCircle } from "lucide-react";
import type { ReviewController } from "@/components/books/editor/review/types";

const labels = {
  unreviewed: ["Não revisado", "Conclua após ler o capítulo."],
  pending: ["Em revisão", "Resolva as anotações antes de concluir."],
  reviewed: ["Revisado", "A versão salva deste capítulo foi revisada."],
  outdated: ["Texto alterado", "Revise as alterações antes de concluir novamente."],
};

export function ReviewProgressCard({ review }: { review: ReviewController }) {
  const completed = review.state === "reviewed";
  const Icon = completed ? CheckCircle2 : review.state === "unreviewed" ? CircleDashed : AlertCircle;
  const [title, hint] = labels[review.state];
  const description = review.state === "pending" && !review.openCommentsCount
    ? "Releia o capítulo e conclua a revisão." : hint;
  return (
    <section aria-label="Progresso da revisão" className="rounded-xl border border-border bg-surface-hover/50 p-3.5">
      <div className="flex items-start gap-2">
        <Icon aria-hidden="true" className={`h-4 w-4 mt-0.5 shrink-0 ${completed ? "text-success" : "text-muted"}`} />
        <div>
          <p className="text-xs font-bold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={review.isPending || (!completed && review.openCommentsCount > 0)}
          onClick={() => void review.markProgress(completed)}
          className="rounded-lg border border-control-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface disabled:opacity-50">
          {review.isPending ? "Salvando..." : completed ? "Sinalizar revisão" : "Concluir revisão"}
        </button>
        {review.openCommentsCount > 0 && <p className="text-xs text-muted">Há comentários abertos.</p>}
      </div>
    </section>
  );
}

