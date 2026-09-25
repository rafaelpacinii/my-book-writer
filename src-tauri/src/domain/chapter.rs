use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Representa um capítulo completo incluindo o conteúdo rico em JSON
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Chapter {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub position: i64,
    pub content_json: String,
    pub content_schema_version: i64,
    pub content_revision: i64,
    pub track_changes_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

/// Versão leve para listagem no sumário / barra lateral (não carrega o JSON pesado)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChapterSummary {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub position: i64,
    pub content_revision: i64,
    pub track_changes_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// DTO para criação de capítulo
#[derive(Debug, Clone, Deserialize)]
pub struct CreateChapterInput {
    pub book_id: String,
    pub title: String,
    pub content_json: Option<String>,
}
