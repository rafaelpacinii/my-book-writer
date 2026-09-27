/**
 * Representa um livro persistido na tabela `books` do SQLite.
 */
export interface Book {
  id: string;
  profile_id: string;
  format_id: string;
  font_preset_id: string;
  title: string;
  author_name: string;
  card_image_asset_id: string | null;
  position: number;
  font_size_pt: number;
  line_height_ratio: number;
  margin_top_um: number;
  margin_bottom_um: number;
  margin_left_um: number;
  margin_right_um: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Parâmetros de criação de um novo livro enviados para o Tauri IPC.
 */
export interface CreateBookInput {
  profile_id: string;
  format_id: string;
  font_preset_id: string;
  title: string;
  author_name: string;
  synopsis?: string | null;
  font_size_pt?: number | null;
  line_height_ratio?: number | null;
  margin_top_um?: number | null;
  margin_bottom_um?: number | null;
  margin_left_um?: number | null;
  margin_right_um?: number | null;
}

/**
 * Parâmetros opcionais para atualização de um livro existente.
 */
export interface UpdateBookInput {
  title?: string | null;
  author_name?: string | null;
  format_id?: string | null;
  font_preset_id?: string | null;
  card_image_asset_id?: string | null;
  font_size_pt?: number | null;
  line_height_ratio?: number | null;
  margin_top_um?: number | null;
  margin_bottom_um?: number | null;
  margin_left_um?: number | null;
  margin_right_um?: number | null;
}
