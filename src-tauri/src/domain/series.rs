use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Representa uma Série de Livros persistida na tabela `book_series` do SQLite.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BookSeries {
    pub id: String,
    pub profile_id: String,
    pub universe_id: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub position: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

/// Dados recebidos do frontend para criar uma nova Série de Livros.
#[derive(Debug, Clone, Deserialize)]
pub struct CreateSeriesInput {
    pub profile_id: String,
    pub universe_id: Option<String>,
    pub name: String,
    pub description: Option<String>,
}

/// Dados recebidos do frontend para atualizar uma Série de Livros existente.
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateSeriesInput {
    pub name: Option<String>,
    pub description: Option<String>,
    pub universe_id: Option<String>,
    pub clear_universe: Option<bool>,
}

