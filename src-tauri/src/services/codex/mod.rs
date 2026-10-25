mod entities;
mod gallery;
mod image_data;
mod presets;
mod structure;
mod templates;
#[cfg(test)]
mod tests;
mod validation;

use crate::domain::codex::*;
use crate::error::AppError;
use crate::repositories::codex::CodexRepository as Repo;
use sqlx::SqlitePool;

pub struct CodexService<'a> {
    pub(super) pool: &'a SqlitePool,
}
impl<'a> CodexService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }
    pub async fn resolve_scope(&self, input: CodexScopeInput) -> Result<CodexScope, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        tx.commit().await?;
        Ok(scope)
    }
    pub async fn list_scopes(&self, profile: &str) -> Result<Vec<CodexContext>, AppError> {
        let mut conn = self.pool.acquire().await?;
        Repo::contexts(&mut conn, profile).await
    }
    pub async fn list_entities(
        &self,
        input: CodexScopeInput,
        kind: Option<CodexKind>,
    ) -> Result<Vec<CodexEntity>, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        let entities = Repo::entities(&mut tx, &scope, kind).await?;
        tx.commit().await?;
        Ok(entities)
    }
    pub async fn get_sheet(
        &self,
        input: CodexScopeInput,
        id: &str,
    ) -> Result<CodexSheet, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        let sheet = Repo::sheet(&mut tx, &scope, id).await?;
        tx.commit().await?;
        Ok(sheet)
    }
}
