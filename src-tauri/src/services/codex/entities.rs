use super::{presets, structure, validation::*, CodexService};
use crate::domain::codex::*;
use crate::error::AppError;
use crate::repositories::codex::CodexRepository as Repo;
use uuid::Uuid;

impl CodexService<'_> {
    pub async fn create_entity(
        &self,
        input: CreateCodexEntityInput,
    ) -> Result<CodexSheet, AppError> {
        let name = label(&input.name)?;
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input.scope).await?;
        writable(&scope)?;
        presets::ensure(&mut tx, &scope.profile_id).await?;
        let template = if let Some(id) = input.template_id {
            Repo::template(&mut tx, &scope.profile_id, &id).await?
        } else {
            Repo::templates(&mut tx, &scope.profile_id)
                .await?
                .into_iter()
                .find(|t| t.kind == input.kind.as_str() && t.preset_key.is_some())
                .ok_or_else(|| invalid("Modelo inicial não encontrado"))?
        };
        if template.kind != input.kind.as_str() {
            return Err(invalid("O modelo não corresponde ao tipo da ficha"));
        }
        let schema: Vec<CodexCategoryInput> =
            serde_json::from_str(&template.schema_json).map_err(|_| invalid("Modelo inválido"))?;
        let id = Uuid::now_v7().to_string();
        Repo::create(&mut tx, &scope, &id, input.kind, &name).await?;
        let schema = structure::prepare(&mut tx, &scope, &id, schema).await?;
        Repo::replace_structure(&mut tx, &id, &schema).await?;
        let sheet = Repo::sheet(&mut tx, &scope, &id).await?;
        tx.commit().await?;
        Ok(sheet)
    }
    pub async fn update_entity(
        &self,
        scope: CodexScopeInput,
        id: &str,
        input: UpdateCodexEntityInput,
    ) -> Result<CodexEntity, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &scope).await?;
        writable(&scope)?;
        let mut entity = Repo::entity(&mut tx, &scope, id).await?;
        if let Some(name) = input.name {
            entity.name = label(&name)?;
        }
        if let Some(value) = input.summary {
            entity.summary = text(value)?;
        }
        if let Some(value) = input.role {
            entity.role = text(value)?;
        }
        if let Some(value) = input.status {
            entity.status = text(value)?;
        }
        if let Some(value) = input.archetype {
            entity.archetype = text(value)?;
        }
        if let Some(values) = input.tags {
            entity.tags_json =
                serde_json::to_string(&tags(values)?).map_err(|_| invalid("Tags inválidas"))?;
        }
        Repo::update(&mut tx, &entity).await?;
        let entity = Repo::entity(&mut tx, &scope, id).await?;
        tx.commit().await?;
        Ok(entity)
    }
    pub async fn delete_entity(&self, scope: CodexScopeInput, id: &str) -> Result<(), AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &scope).await?;
        writable(&scope)?;
        Repo::entity(&mut tx, &scope, id).await?;
        Repo::delete(&mut tx, id).await?;
        tx.commit().await?;
        Ok(())
    }
}
