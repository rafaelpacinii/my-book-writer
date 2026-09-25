use crate::domain::catalog::{BookFormat, FontPreset};
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct CatalogRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> CatalogRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Retorna todos os formatos de livro ativos no catálogo
    pub async fn list_active_formats(&self) -> Result<Vec<BookFormat>, AppError> {
        let formats = sqlx::query_as::<_, BookFormat>(
            r#"
            SELECT id, name, market, width_um, height_um, is_active
            FROM book_formats
            WHERE is_active = 1
            ORDER BY market ASC, name ASC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        Ok(formats)
    }

    /// Retorna todos os presets de fontes ativas no catálogo
    pub async fn list_active_font_presets(&self) -> Result<Vec<FontPreset>, AppError> {
        let presets = sqlx::query_as::<_, FontPreset>(
            r#"
            SELECT id, name, family_name, manifest_path, is_active
            FROM font_presets
            WHERE is_active = 1
            ORDER BY name ASC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        Ok(presets)
    }
}
