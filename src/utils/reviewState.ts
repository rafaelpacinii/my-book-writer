import type { ReviewProgress, ReviewState } from "@/types/review";

export function reviewState(progress: ReviewProgress | null, revision: number, openComments: number, dirty = false): ReviewState {
  if (progress && (progress.reviewed_content_revision !== revision || dirty)) return "outdated";
  if (openComments || progress?.needs_recheck) return "pending";
  return progress ? "reviewed" : "unreviewed";
}

export function reviewError(cause: unknown): string {
  if (cause instanceof DOMException && cause.name === "QuotaExceededError") return "Não há espaço para salvar a revisão. Libere espaço e tente novamente.";
  const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "";
  if (/^(O capítulo|O comentário|O trecho|A conclusão|Resolva|Capítulo|Comentário|Perfil|Não foi possível|Os comentários|O progresso|Não há espaço)/.test(message)) return message;
  return "Não foi possível acessar a revisão neste dispositivo. Tente novamente.";
}
