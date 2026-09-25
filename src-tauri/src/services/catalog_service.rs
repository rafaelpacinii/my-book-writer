use crate::domain::catalog::{BookFormat, FontPreset};
use crate::error::AppError;
use crate::repositories::catalog_repository::CatalogRepository;
use sqlx::SqlitePool;

pub struct CatalogService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> CatalogService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Retorna os formatos de livros ativos disponíveis no catálogo
    pub async fn list_formats(&self) -> Result<Vec<BookFormat>, AppError> {
        let repo = CatalogRepository::new(self.pool);
        repo.list_active_formats().await
    }

    /// Retorna os presets de fontes ativas disponíveis no catálogo
    pub async fn list_font_presets(&self) -> Result<Vec<FontPreset>, AppError> {
        let repo = CatalogRepository::new(self.pool);
        repo.list_active_font_presets().await
    }
}
