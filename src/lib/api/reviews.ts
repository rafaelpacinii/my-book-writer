import { invoke } from "@tauri-apps/api/core";
import type {
  CreateCommentInput,
  MarkProgressInput,
  ReviewComment,
  ReviewProgress,
} from "@/types/review";

/**
 * Cria um comentário de revisão ancorado em um trecho do capítulo.
 */
export async function createReviewComment(
  input: CreateCommentInput,
): Promise<ReviewComment> {
  return invoke<ReviewComment>("create_review_comment", { input });
}

/**
 * Lista todos os comentários de revisão de um capítulo.
 */
export async function listReviewComments(
  chapterId: string,
): Promise<ReviewComment[]> {
  return invoke<ReviewComment[]>("list_review_comments", { chapterId });
}

/**
 * Marca um comentário como resolvido.
 */
export async function resolveReviewComment(id: string): Promise<ReviewComment> {
  return invoke<ReviewComment>("resolve_review_comment", { id });
}

/**
 * Reabre um comentário previamente resolvido.
 */
export async function reopenReviewComment(id: string): Promise<ReviewComment> {
  return invoke<ReviewComment>("reopen_review_comment", { id });
}

/**
 * Obtém a última marcação de progresso de revisão do capítulo.
 */
export async function getReviewProgress(
  chapterId: string,
): Promise<ReviewProgress | null> {
  return invoke<ReviewProgress | null>("get_review_progress", { chapterId });
}

/**
 * Salva ou atualiza a marcação de progresso de leitura/revisão de um capítulo.
 */
export async function markReviewProgress(
  input: MarkProgressInput,
): Promise<ReviewProgress> {
  return invoke<ReviewProgress>("mark_review_progress", { input });
}
