use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Representa um Universo Literário persistido na tabela `universes` do SQLite.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Universe {
    pub id: String,
    pub profile_id: String,
    pub name: String,
    pub description: Option<String>,
    pub position: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

/// Dados recebidos do frontend para criar um novo Universo Literário.
#[derive(Debug, Clone, Deserialize)]
pub struct CreateUniverseInput {
    pub profile_id: String,
    pub name: String,
    pub description: Option<String>,
}

/// Dados recebidos do frontend para atualizar um Universo Literário existente.
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateUniverseInput {
    pub name: Option<String>,
    pub description: Option<String>,
}

