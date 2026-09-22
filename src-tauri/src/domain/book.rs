use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Representa um registro completo da tabela `books` no SQLite.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Book {
    pub id: String,
    pub profile_id: String,
    pub format_id: String,
    pub font_preset_id: String,
    pub title: String,
    pub author_name: String,
    pub card_image_asset_id: Option<String>,
    pub position: i64,
    pub font_size_pt: f64,
    pub line_height_ratio: f64,
    pub margin_top_um: i64,
    pub margin_bottom_um: i64,
    pub margin_left_um: i64,
    pub margin_right_um: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

/// Dados recebidos do frontend ao solicitar a criação de um livro.
#[derive(Debug, Clone, Deserialize)]
pub struct CreateBookInput {
    pub profile_id: String,
    pub format_id: String,
    pub font_preset_id: String,
    pub title: String,
    pub author_name: String,
    pub synopsis: Option<String>,
    pub font_size_pt: Option<f64>,
    pub line_height_ratio: Option<f64>,
    pub margin_top_um: Option<i64>,
    pub margin_bottom_um: Option<i64>,
    pub margin_left_um: Option<i64>,
    pub margin_right_um: Option<i64>,
}
