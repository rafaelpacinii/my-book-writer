use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Representa o perfil local do autor na tabela `local_profiles`.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LocalProfile {
    pub id: String,
    pub display_name: String,
    pub created_at: String,
    pub updated_at: String,
}
