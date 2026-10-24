/**
 * Representa uma Série de Livros persistida na tabela `book_series` do SQLite.
 */
export interface BookSeries {
  id: string;
  profile_id: string;
  universe_id: string | null;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Parâmetros para criação de uma nova Série de Livros.
 */
export interface CreateSeriesInput {
  profile_id: string;
  universe_id?: string | null;
  name: string;
  description?: string | null;
}

/**
 * Parâmetros para atualização de uma Série de Livros existente.
 */
export interface UpdateSeriesInput {
  name?: string | null;
  description?: string | null;
  universe_id?: string | null;
  clear_universe?: boolean;
}

