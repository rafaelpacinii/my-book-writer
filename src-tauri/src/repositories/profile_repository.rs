use crate::domain::profile::LocalProfile;
use crate::error::AppError;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct ProfileRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ProfileRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Busca o perfil padrão ativo. Se a tabela estiver vazia por qualquer motivo,
    /// cria automaticamente o perfil 'Autor' de fallback para que a aplicação nunca quebre.
    pub async fn get_default(&self) -> Result<LocalProfile, AppError> {
        let existing = sqlx::query_as::<_, LocalProfile>(
            "SELECT id, display_name, created_at, updated_at FROM local_profiles ORDER BY created_at ASC LIMIT 1"
        )
        .fetch_optional(self.pool)
        .await?;

        if let Some(profile) = existing {
            return Ok(profile);
        }

        // Fallback resiliente: cria o perfil inicial se não existir
        let fallback_id = Uuid::now_v7().to_string();
        let created = sqlx::query_as::<_, LocalProfile>(
            r#"
            INSERT INTO local_profiles (id, display_name, created_at, updated_at)
            VALUES (?, 'Autor', datetime('now'), datetime('now'))
            RETURNING *
            "#,
        )
        .bind(&fallback_id)
        .fetch_one(self.pool)
        .await?;

        Ok(created)
    }

    /// Atualiza o nome de exibição do autor no SQLite
    pub async fn update_display_name(
        &self,
        id: &str,
        display_name: &str,
    ) -> Result<LocalProfile, AppError> {
        let updated = sqlx::query_as::<_, LocalProfile>(
            r#"
            UPDATE local_profiles
            SET display_name = ?, updated_at = datetime('now')
            WHERE id = ?
            RETURNING *
            "#,
        )
        .bind(display_name)
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(updated)
    }
}
