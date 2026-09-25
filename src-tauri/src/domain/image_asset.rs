use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Metadados de uma imagem física gerenciada pelo aplicativo
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ImageAsset {
    pub id: String,
    pub book_id: String,
    pub original_filename: String,
    pub storage_key: String,
    pub mime_type: String,
    pub width_px: i64,
    pub height_px: i64,
    pub byte_size: i64,
    pub sha256: String,
    pub created_at: String,
}

/// DTO recebido para importação de nova imagem
#[derive(Debug, Clone, Deserialize)]
pub struct ImportImageInput {
    pub book_id: String,
    pub original_filename: String,
    pub mime_type: String,
    pub width_px: i64,
    pub height_px: i64,
    pub data_base64: String,
}
