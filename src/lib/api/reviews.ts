import { browserCreateComment, browserListComments, browserChangeComment, browserGetProgress, browserMarkProgress } from "@/lib/api/browserReviews";
import { invoke } from "@tauri-apps/api/core";
import type {
  CreateCommentInput,
  MarkProgressInput,
  ReviewComment,
  ReviewProgress,
} from "@/types/review";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

/**
 * Cria um comentário de revisão ancorado em um trecho do capítulo.
 */
export async function createReviewComment(
  input: CreateCommentInput,
): Promise<ReviewComment> {
  if (!isTauriEnvironment()) { return browserCreateComment(input); }

  return invoke<ReviewComment>("create_review_comment", { input });
}

/**
 * Lista todos os comentários de revisão de um capítulo.
 */
export async function listReviewComments(
  chapterId: string,
): Promise<ReviewComment[]> {
  if (!isTauriEnvironment()) { return browserListComments(chapterId); }

  return invoke<ReviewComment[]>("list_review_comments", { chapterId });
}

/**
 * Marca um comentário como resolvido.
 */
export async function resolveReviewComment(id: string): Promise<ReviewComment> {
  if (!isTauriEnvironment()) { return browserChangeComment(id, "resolved"); }

  return invoke<ReviewComment>("resolve_review_comment", { id });
}

/**
 * Reabre um comentário previamente resolvido.
 */
export async function reopenReviewComment(id: string): Promise<ReviewComment> {
  if (!isTauriEnvironment()) { return browserChangeComment(id, "open"); }

  return invoke<ReviewComment>("reopen_review_comment", { id });
}

/**
 * Atualiza o texto de um comentário de revisão existente.
 */
export async function updateReviewComment(
  id: string,
  body: string,
): Promise<ReviewComment> {
  if (!isTauriEnvironment()) { return browserChangeComment(id, "edit", body); }

  return invoke<ReviewComment>("update_review_comment", { id, body });
}

/**
 * Remove definitivamente um comentário de revisão.
 */
export async function deleteReviewComment(id: string): Promise<void> {
  if (!isTauriEnvironment()) { browserChangeComment(id, "delete"); return; }

  return invoke<void>("delete_review_comment", { id });
}

/**
 * Obtém a última marcação de progresso de revisão do capítulo.
 */
export async function getReviewProgress(
  chapterId: string,
): Promise<ReviewProgress | null> {
  if (!isTauriEnvironment()) { return browserGetProgress(chapterId); }

  return invoke<ReviewProgress | null>("get_review_progress", { chapterId });
}

/**
 * Salva ou atualiza a marcação de progresso de leitura/revisão de um capítulo.
 */
export async function markReviewProgress(
  input: MarkProgressInput,
): Promise<ReviewProgress> {
  if (!isTauriEnvironment()) { return browserMarkProgress(input); }

  return invoke<ReviewProgress>("mark_review_progress", { input });
}
