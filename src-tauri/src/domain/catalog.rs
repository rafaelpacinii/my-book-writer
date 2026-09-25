use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Representa um formato físico de livro pré-definido no catálogo (`book_formats`).
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BookFormat {
    pub id: String,
    pub name: String,
    pub market: String,
    pub width_um: i64,
    pub height_um: i64,
    pub is_active: bool,
}

/// Representa um preset de fonte embutida no aplicativo (`font_presets`).
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FontPreset {
    pub id: String,
    pub name: String,
    pub family_name: String,
    pub manifest_path: String,
    pub is_active: bool,
}
