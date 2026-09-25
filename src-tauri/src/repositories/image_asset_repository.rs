use crate::domain::image_asset::ImageAsset;
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct ImageAssetRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ImageAssetRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Registra os metadados da imagem no SQLite
    #[allow(clippy::too_many_arguments)]
    pub async fn create(
        &self,
        id: &str,
        book_id: &str,
        original_filename: &str,
        storage_key: &str,
        mime_type: &str,
        width_px: i64,
        height_px: i64,
        byte_size: i64,
        sha256: &str,
    ) -> Result<ImageAsset, AppError> {
        let asset = sqlx::query_as::<_, ImageAsset>(
            r#"
            INSERT INTO image_assets (
                id, book_id, original_filename, storage_key, mime_type,
                width_px, height_px, byte_size, sha256, created_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, datetime('now')
            )
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(book_id)
        .bind(original_filename)
        .bind(storage_key)
        .bind(mime_type)
        .bind(width_px)
        .bind(height_px)
        .bind(byte_size)
        .bind(sha256)
        .fetch_one(self.pool)
        .await?;

        Ok(asset)
    }

    /// Lista todas as imagens pertencentes a um livro
    pub async fn list_by_book(&self, book_id: &str) -> Result<Vec<ImageAsset>, AppError> {
        let assets = sqlx::query_as::<_, ImageAsset>(
            "SELECT * FROM image_assets WHERE book_id = ? ORDER BY created_at DESC",
        )
        .bind(book_id)
        .fetch_all(self.pool)
        .await?;

        Ok(assets)
    }

    /// Busca imagem por ID
    pub async fn find_by_id(&self, id: &str) -> Result<Option<ImageAsset>, AppError> {
        let asset = sqlx::query_as::<_, ImageAsset>("SELECT * FROM image_assets WHERE id = ?")
            .bind(id)
            .fetch_optional(self.pool)
            .await?;

        Ok(asset)
    }

    /// Vincula ou desvincula uma imagem como capa/card do livro
    pub async fn set_book_card_image(
        &self,
        book_id: &str,
        asset_id: Option<&str>,
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE books SET card_image_asset_id = ?, updated_at = datetime('now') WHERE id = ?",
        )
        .bind(asset_id)
        .bind(book_id)
        .execute(self.pool)
        .await?;

        Ok(())
    }
}
