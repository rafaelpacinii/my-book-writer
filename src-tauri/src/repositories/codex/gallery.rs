use super::CodexRepository;
use crate::domain::codex::CodexImage;
use crate::error::AppError;
use sqlx::SqliteConnection;

impl CodexRepository {
    pub async fn gallery_image(
        conn: &mut SqliteConnection,
        entity: &str,
        id: &str,
    ) -> Result<(CodexImage, String), AppError> {
        let image: CodexImage = sqlx::query_as(
            "SELECT * FROM codex_entity_images WHERE id=? AND entity_id=? AND deleted_at IS NULL",
        )
        .bind(id)
        .bind(entity)
        .fetch_optional(&mut *conn)
        .await?
        .ok_or_else(|| AppError::NotFound("Imagem não encontrada nesta ficha".into()))?;
        let key = sqlx::query_scalar("SELECT storage_key FROM image_assets WHERE id=?")
            .bind(&image.image_asset_id)
            .fetch_one(conn)
            .await?;
        Ok((image, key))
    }
    pub async fn image_count(conn: &mut SqliteConnection, entity: &str) -> Result<i64, AppError> {
        Ok(sqlx::query_scalar(
            "SELECT count(*) FROM codex_entity_images WHERE entity_id=? AND deleted_at IS NULL",
        )
        .bind(entity)
        .fetch_one(conn)
        .await?)
    }
    #[allow(clippy::too_many_arguments)]
    pub async fn attach_image(
        conn: &mut SqliteConnection,
        entity: &str,
        id: &str,
        asset: &str,
        filename: &str,
        key: &str,
        mime: &str,
        width: u32,
        height: u32,
        size: usize,
        hash: &str,
    ) -> Result<(), AppError> {
        sqlx::query("INSERT INTO image_assets (id,codex_entity_id,original_filename,storage_key,mime_type,width_px,height_px,byte_size,sha256,created_at) VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))")
            .bind(asset).bind(entity).bind(filename).bind(key).bind(mime).bind(width).bind(height).bind(size as i64).bind(hash).execute(&mut *conn).await?;
        sqlx::query("INSERT INTO codex_entity_images (id,entity_id,image_asset_id,caption,is_primary,position,created_at,updated_at) VALUES (?,?,?,?,NOT EXISTS(SELECT 1 FROM codex_entity_images WHERE entity_id=? AND deleted_at IS NULL), (SELECT COALESCE(MAX(position),-1)+1 FROM codex_entity_images WHERE entity_id=?),datetime('now'),datetime('now'))")
            .bind(id).bind(entity).bind(asset).bind(filename).bind(entity).bind(entity).execute(&mut *conn).await?;
        Self::touch_gallery(conn, entity).await
    }
    pub async fn update_gallery_image(
        conn: &mut SqliteConnection,
        entity: &str,
        id: &str,
        caption: &str,
        primary: bool,
    ) -> Result<(), AppError> {
        if primary {
            sqlx::query("UPDATE codex_entity_images SET is_primary=0,updated_at=datetime('now') WHERE entity_id=? AND deleted_at IS NULL")
                .bind(entity).execute(&mut *conn).await?;
        }
        sqlx::query("UPDATE codex_entity_images SET caption=?,is_primary=CASE WHEN ? THEN 1 ELSE is_primary END,updated_at=datetime('now') WHERE id=?")
            .bind(caption).bind(primary).bind(id).execute(&mut *conn).await?;
        Self::touch_gallery(conn, entity).await
    }
    pub async fn remove_gallery_image(
        conn: &mut SqliteConnection,
        entity: &str,
        image: &CodexImage,
    ) -> Result<(), AppError> {
        sqlx::query("UPDATE codex_entity_images SET deleted_at=datetime('now'),is_primary=0,updated_at=datetime('now') WHERE id=?")
            .bind(&image.id).execute(&mut *conn).await?;
        if image.is_primary {
            sqlx::query("UPDATE codex_entity_images SET is_primary=1,updated_at=datetime('now') WHERE id=(SELECT id FROM codex_entity_images WHERE entity_id=? AND deleted_at IS NULL ORDER BY position,id LIMIT 1)")
                .bind(entity).execute(&mut *conn).await?;
        }
        Self::touch_gallery(conn, entity).await
    }
    async fn touch_gallery(conn: &mut SqliteConnection, entity: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE codex_entities SET updated_at=datetime('now') WHERE id=?")
            .bind(entity)
            .execute(conn)
            .await?;
        Ok(())
    }
}
