use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Snapshot ou versão histórica de um capítulo
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChapterVersion {
    pub id: String,
    pub chapter_id: String,
    pub version_number: i64,
    pub title: String,
    pub content_json: String,
    pub description: Option<String>,
    pub word_count: i64,
    pub created_at: String,
}

/// DTO leve para listagem no painel de histórico (sem content_json)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChapterVersionSummary {
    pub id: String,
    pub chapter_id: String,
    pub version_number: i64,
    pub title: String,
    pub description: Option<String>,
    pub word_count: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateVersionInput {
    pub chapter_id: String,
    pub description: Option<String>,
}
