export type AnchorState = "attached" | "removed";
export type CommentStatus = "open" | "resolved";

/**
 * Representa um comentário de revisão ancorado em um trecho do capítulo.
 */
export interface ReviewComment {
  id: string;
  chapter_id: string;
  author_profile_id: string;
  body: string;
  original_excerpt: string;
  anchor_json: string | null;
  anchor_revision: number;
  anchor_state: AnchorState;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

/**
 * Parâmetros para criação de um novo comentário de revisão.
 */
export interface CreateCommentInput {
  chapter_id: string;
  author_profile_id: string;
  body: string;
  original_excerpt: string;
  anchor_json?: string | null;
  anchor_revision: number;
}

/**
 * Registro de progresso de revisão/leitura alcançado em um capítulo.
 */
export interface ReviewProgress {
  chapter_id: string;
  profile_id: string;
  anchor_json: string | null;
  anchor_revision: number;
  reviewed_content_revision: number;
  needs_recheck: boolean;
  marked_at: string;
  updated_at: string;
}

/**
 * Parâmetros para marcar ou atualizar o progresso de revisão.
 */
export interface MarkProgressInput {
  chapter_id: string;
  profile_id: string;
  anchor_json?: string | null;
  anchor_revision: number;
  reviewed_content_revision: number;
  needs_recheck: boolean;
}
