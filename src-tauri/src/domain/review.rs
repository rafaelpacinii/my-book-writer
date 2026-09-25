use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Comentário de revisão associado a um trecho do capítulo
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ReviewComment {
    pub id: String,
    pub chapter_id: String,
    pub author_profile_id: String,
    pub body: String,
    pub original_excerpt: String,
    pub anchor_json: Option<String>,
    pub anchor_revision: i64,
    pub anchor_state: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub resolved_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateCommentInput {
    pub chapter_id: String,
    pub author_profile_id: String,
    pub body: String,
    pub original_excerpt: String,
    pub anchor_json: Option<String>,
    pub anchor_revision: i64,
}

/// Registro do ponto de leitura/revisão alcançado em um capítulo
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ReviewProgress {
    pub chapter_id: String,
    pub profile_id: String,
    pub anchor_json: Option<String>,
    pub anchor_revision: i64,
    pub reviewed_content_revision: i64,
    pub needs_recheck: bool,
    pub marked_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct MarkProgressInput {
    pub chapter_id: String,
    pub profile_id: String,
    pub anchor_json: Option<String>,
    pub anchor_revision: i64,
    pub reviewed_content_revision: i64,
    pub needs_recheck: bool,
}
