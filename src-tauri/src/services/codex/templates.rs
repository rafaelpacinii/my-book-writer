use super::{presets, validation::*, CodexService};
use crate::domain::codex::*;
use crate::error::AppError;
use crate::repositories::codex::CodexRepository as Repo;
use uuid::Uuid;

pub(super) fn schema_from_sheet(sheet: &CodexSheet) -> Result<Vec<CodexCategoryInput>, AppError> {
    sheet
        .categories
        .iter()
        .map(|category| {
            let fields = sheet
                .fields
                .iter()
                .filter(|field| field.category_id == category.id)
                .map(|field| {
                    let kind = serde_json::from_value(serde_json::json!(field.field_type))
                        .map_err(|_| invalid("Tipo de campo inválido"))?;
                    let config = serde_json::from_str(&field.config_json)
                        .map_err(|_| invalid("Configuração de campo inválida"))?;
                    Ok(CodexFieldInput {
                        id: None,
                        label: field.label.clone(),
                        field_type: kind,
                        value: empty_value(kind),
                        config,
                    })
                })
                .collect::<Result<Vec<_>, AppError>>()?;
            Ok(CodexCategoryInput {
                id: None,
                name: category.name.clone(),
                fields,
            })
        })
        .collect()
}
impl CodexService<'_> {
    pub async fn list_templates(
        &self,
        profile: &str,
        kind: Option<CodexKind>,
    ) -> Result<Vec<CodexTemplate>, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        presets::ensure(&mut tx, profile).await?;
        let result = Repo::templates(&mut tx, profile)
            .await?
            .into_iter()
            .filter(|template| kind.is_none_or(|kind| kind.as_str() == template.kind))
            .collect();
        tx.commit().await?;
        Ok(result)
    }
    /// Copia somente a estrutura: textos, vínculos e imagens da ficha não viram dados de outras fichas.
    pub async fn save_template(
        &self,
        scope: CodexScopeInput,
        entity_id: &str,
        name: &str,
    ) -> Result<CodexTemplate, AppError> {
        let name = label(name)?;
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &scope).await?;
        let sheet = Repo::sheet(&mut tx, &scope, entity_id).await?;
        let schema = serde_json::to_string(&schema_from_sheet(&sheet)?)
            .map_err(|_| invalid("Estrutura inválida"))?;
        let id = Uuid::now_v7().to_string();
        Repo::insert_template(
            &mut tx,
            &scope.profile_id,
            &id,
            &sheet.entity.kind,
            &name,
            None,
            &schema,
        )
        .await?;
        let result = Repo::template(&mut tx, &scope.profile_id, &id).await?;
        tx.commit().await?;
        Ok(result)
    }
    pub async fn delete_template(&self, profile: &str, id: &str) -> Result<(), AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        Repo::profile(&mut tx, profile).await?;
        let template = Repo::template(&mut tx, profile, id).await?;
        if template.preset_key.is_some() {
            return Err(invalid(
                "Os modelos iniciais são preservados; salve uma cópia personalizada",
            ));
        }
        Repo::delete_template(&mut tx, id).await?;
        tx.commit().await?;
        Ok(())
    }
}
