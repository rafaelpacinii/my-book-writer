/**
 * Representa um capítulo completo, incluindo o conteúdo canônico em JSON.
 */
export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  position: number;
  content_json: string;
  content_schema_version: number;
  content_revision: number;
  track_changes_enabled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Versão resumida do capítulo para listagens, sumário e sidebar.
 * Não carrega o campo pesado `content_json`.
 */
export interface ChapterSummary {
  id: string;
  book_id: string;
  title: string;
  position: number;
  content_revision: number;
  track_changes_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Parâmetros para criação de um novo capítulo.
 */
export interface CreateChapterInput {
  book_id: string;
  title: string;
  content_json?: string | null;
}
