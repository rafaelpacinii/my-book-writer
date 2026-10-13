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

const COMMENTS_STORAGE_KEY = "my_book_writer_review_comments";
const PROGRESS_STORAGE_KEY = "my_book_writer_review_progress";

function getStoredComments(): ReviewComment[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ReviewComment[];
  } catch {
    return [];
  }
}

function saveStoredComments(list: ReviewComment[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(list));
  }
}

function getStoredProgress(): Record<string, ReviewProgress> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, ReviewProgress>;
  } catch {
    return {};
  }
}

function saveStoredProgress(map: Record<string, ReviewProgress>): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
  }
}

/**
 * Cria um comentário de revisão ancorado em um trecho do capítulo.
 */
export async function createReviewComment(
  input: CreateCommentInput,
): Promise<ReviewComment> {
  if (!isTauriEnvironment()) {
    const list = getStoredComments();
    const now = new Date().toISOString();
    const comment: ReviewComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      chapter_id: input.chapter_id,
      author_profile_id: input.author_profile_id,
      body: input.body,
      original_excerpt: input.original_excerpt,
      anchor_json: input.anchor_json ?? null,
      anchor_revision: input.anchor_revision,
      anchor_state: input.anchor_json ? "attached" : "removed",
      status: "open",
      created_at: now,
      updated_at: now,
      resolved_at: null,
    };
    list.push(comment);
    saveStoredComments(list);
    return comment;
  }
  return invoke<ReviewComment>("create_review_comment", { input });
}

/**
 * Lista todos os comentários de revisão de um capítulo.
 */
export async function listReviewComments(
  chapterId: string,
): Promise<ReviewComment[]> {
  if (!isTauriEnvironment()) {
    return getStoredComments().filter((c) => c.chapter_id === chapterId);
  }
  return invoke<ReviewComment[]>("list_review_comments", { chapterId });
}

/**
 * Marca um comentário como resolvido.
 */
export async function resolveReviewComment(id: string): Promise<ReviewComment> {
  if (!isTauriEnvironment()) {
    const list = getStoredComments();
    const comment = list.find((c) => c.id === id);
    if (!comment) throw new Error("Comentário não encontrado");
    comment.status = "resolved";
    comment.resolved_at = new Date().toISOString();
    comment.updated_at = new Date().toISOString();
    saveStoredComments(list);
    return comment;
  }
  return invoke<ReviewComment>("resolve_review_comment", { id });
}

/**
 * Reabre um comentário previamente resolvido.
 */
export async function reopenReviewComment(id: string): Promise<ReviewComment> {
  if (!isTauriEnvironment()) {
    const list = getStoredComments();
    const comment = list.find((c) => c.id === id);
    if (!comment) throw new Error("Comentário não encontrado");
    comment.status = "open";
    comment.resolved_at = null;
    comment.updated_at = new Date().toISOString();
    saveStoredComments(list);
    return comment;
  }
  return invoke<ReviewComment>("reopen_review_comment", { id });
}

/**
 * Atualiza o texto de um comentário de revisão existente.
 */
export async function updateReviewComment(
  id: string,
  body: string,
): Promise<ReviewComment> {
  if (!isTauriEnvironment()) {
    const list = getStoredComments();
    const comment = list.find((c) => c.id === id);
    if (!comment) throw new Error("Comentário não encontrado");
    comment.body = body.trim();
    comment.updated_at = new Date().toISOString();
    saveStoredComments(list);
    return comment;
  }
  return invoke<ReviewComment>("update_review_comment", { id, body });
}

/**
 * Remove definitivamente um comentário de revisão.
 */
export async function deleteReviewComment(id: string): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredComments().filter((c) => c.id !== id);
    saveStoredComments(list);
    return;
  }
  return invoke<void>("delete_review_comment", { id });
}

/**
 * Obtém a última marcação de progresso de revisão do capítulo.
 */
export async function getReviewProgress(
  chapterId: string,
): Promise<ReviewProgress | null> {
  if (!isTauriEnvironment()) {
    const map = getStoredProgress();
    return map[chapterId] ?? null;
  }
  return invoke<ReviewProgress | null>("get_review_progress", { chapterId });
}

/**
 * Salva ou atualiza a marcação de progresso de leitura/revisão de um capítulo.
 */
export async function markReviewProgress(
  input: MarkProgressInput,
): Promise<ReviewProgress> {
  if (!isTauriEnvironment()) {
    const map = getStoredProgress();
    const now = new Date().toISOString();
    const progress: ReviewProgress = {
      chapter_id: input.chapter_id,
      profile_id: input.profile_id,
      anchor_json: input.anchor_json ?? null,
      anchor_revision: input.anchor_revision,
      reviewed_content_revision: input.reviewed_content_revision,
      needs_recheck: input.needs_recheck,
      marked_at: map[input.chapter_id]?.marked_at ?? now,
      updated_at: now,
    };
    map[input.chapter_id] = progress;
    saveStoredProgress(map);
    return progress;
  }
  return invoke<ReviewProgress>("mark_review_progress", { input });
}
