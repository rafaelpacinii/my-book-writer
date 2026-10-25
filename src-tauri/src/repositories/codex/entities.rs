use super::CodexRepository;
use crate::domain::codex::*;
use crate::error::AppError;
use sqlx::SqliteConnection;

impl CodexRepository {
    pub async fn entities(
        conn: &mut SqliteConnection,
        scope: &CodexScope,
        kind: Option<CodexKind>,
    ) -> Result<Vec<CodexEntity>, AppError> {
        Ok(sqlx::query_as(
            "SELECT *, (SELECT id FROM codex_entity_images i WHERE i.entity_id=codex_entities.id AND i.is_primary=1 AND i.deleted_at IS NULL) AS primary_image_id FROM codex_entities WHERE profile_id=? AND book_id IS ? AND universe_id IS ?
            AND deleted_at IS NULL AND (? IS NULL OR kind=?) ORDER BY position, name, id",
        )
        .bind(&scope.profile_id)
        .bind(&scope.book_id)
        .bind(&scope.universe_id)
        .bind(kind.map(CodexKind::as_str))
        .bind(kind.map(CodexKind::as_str))
        .fetch_all(conn)
        .await?)
    }
    pub async fn entity(
        conn: &mut SqliteConnection,
        scope: &CodexScope,
        id: &str,
    ) -> Result<CodexEntity, AppError> {
        sqlx::query_as("SELECT *, (SELECT id FROM codex_entity_images i WHERE i.entity_id=codex_entities.id AND i.is_primary=1 AND i.deleted_at IS NULL) AS primary_image_id FROM codex_entities WHERE id=? AND profile_id=? AND book_id IS ? AND universe_id IS ? AND deleted_at IS NULL")
            .bind(id).bind(&scope.profile_id).bind(&scope.book_id).bind(&scope.universe_id)
            .fetch_optional(conn).await?.ok_or_else(|| AppError::NotFound("Ficha não encontrada neste Códice".into()))
    }
    pub async fn create(
        conn: &mut SqliteConnection,
        scope: &CodexScope,
        id: &str,
        kind: CodexKind,
        name: &str,
    ) -> Result<(), AppError> {
        sqlx::query("INSERT INTO codex_entities (id,profile_id,book_id,universe_id,kind,name,position,created_at,updated_at)
            VALUES (?,?,?,?,?,?,(SELECT COALESCE(MAX(position),-1)+1 FROM codex_entities WHERE profile_id=? AND book_id IS ? AND universe_id IS ? AND deleted_at IS NULL),datetime('now'),datetime('now'))")
            .bind(id).bind(&scope.profile_id).bind(&scope.book_id).bind(&scope.universe_id).bind(kind.as_str()).bind(name)
            .bind(&scope.profile_id).bind(&scope.book_id).bind(&scope.universe_id).execute(conn).await?;
        Ok(())
    }
    pub async fn update(conn: &mut SqliteConnection, entity: &CodexEntity) -> Result<(), AppError> {
        sqlx::query("UPDATE codex_entities SET name=?,summary=?,role=?,status=?,archetype=?,tags_json=?,updated_at=datetime('now') WHERE id=?")
            .bind(&entity.name).bind(&entity.summary).bind(&entity.role).bind(&entity.status).bind(&entity.archetype)
            .bind(&entity.tags_json).bind(&entity.id).execute(conn).await?;
        Ok(())
    }
    pub async fn delete(conn: &mut SqliteConnection, id: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE codex_entities SET deleted_at=datetime('now'),updated_at=datetime('now') WHERE id=?")
            .bind(id).execute(conn).await?;
        Ok(())
    }
    pub async fn sheet(
        conn: &mut SqliteConnection,
        scope: &CodexScope,
        id: &str,
    ) -> Result<CodexSheet, AppError> {
        let entity = Self::entity(conn, scope, id).await?;
        let categories = sqlx::query_as("SELECT * FROM codex_categories WHERE entity_id=? AND deleted_at IS NULL ORDER BY position,id")
            .bind(id).fetch_all(&mut *conn).await?;
        let fields = sqlx::query_as("SELECT f.* FROM codex_fields f JOIN codex_categories c ON c.id=f.category_id
            WHERE c.entity_id=? AND c.deleted_at IS NULL AND f.deleted_at IS NULL ORDER BY c.position,f.position,f.id")
            .bind(id).fetch_all(&mut *conn).await?;
        let images = sqlx::query_as("SELECT * FROM codex_entity_images WHERE entity_id=? AND deleted_at IS NULL ORDER BY position,id")
            .bind(id).fetch_all(conn).await?;
        Ok(CodexSheet {
            entity,
            categories,
            fields,
            images,
        })
    }
}
