/**
 * Metadados de um ativo de imagem registrado no SQLite e armazenado em disco.
 */
export interface ImageAsset {
  id: string;
  book_id: string;
  original_filename: string;
  storage_key: string;
  mime_type: string;
  width_px: number;
  height_px: number;
  byte_size: number;
  sha256: string;
  created_at: string;
}

/**
 * Parâmetros de importação de uma imagem em Base64 para gravação em disco e persistência.
 */
export interface ImportImageInput {
  book_id: string;
  original_filename: string;
  mime_type: string;
  width_px: number;
  height_px: number;
  data_base64: string;
}
