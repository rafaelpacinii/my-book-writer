use super::CodexRepository;
use crate::domain::codex::*;
use crate::error::AppError;
use sqlx::SqliteConnection;

impl CodexRepository {
    pub async fn templates(
        conn: &mut SqliteConnection,
        profile: &str,
    ) -> Result<Vec<CodexTemplate>, AppError> {
        Ok(sqlx::query_as("SELECT * FROM codex_templates WHERE profile_id=? AND deleted_at IS NULL ORDER BY preset_key IS NULL,name,id")
            .bind(profile).fetch_all(conn).await?)
    }
    pub async fn template(
        conn: &mut SqliteConnection,
        profile: &str,
        id: &str,
    ) -> Result<CodexTemplate, AppError> {
        sqlx::query_as(
            "SELECT * FROM codex_templates WHERE id=? AND profile_id=? AND deleted_at IS NULL",
        )
        .bind(id)
        .bind(profile)
        .fetch_optional(conn)
        .await?
        .ok_or_else(|| AppError::NotFound("Modelo não encontrado neste perfil".into()))
    }
    pub async fn insert_template(
        conn: &mut SqliteConnection,
        profile: &str,
        id: &str,
        kind: &str,
        name: &str,
        preset: Option<&str>,
        schema: &str,
    ) -> Result<(), AppError> {
        sqlx::query("INSERT INTO codex_templates (id,profile_id,kind,name,preset_key,schema_json,created_at,updated_at)
            VALUES (?,?,?,?,?,?,datetime('now'),datetime('now')) ON CONFLICT(profile_id,preset_key) DO NOTHING")
            .bind(id).bind(profile).bind(kind).bind(name).bind(preset).bind(schema).execute(conn).await?;
        Ok(())
    }
    pub async fn delete_template(conn: &mut SqliteConnection, id: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE codex_templates SET deleted_at=datetime('now'),updated_at=datetime('now') WHERE id=?")
            .bind(id).execute(conn).await?;
        Ok(())
    }
}
