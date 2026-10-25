use super::{validation::*, CodexService};
use crate::domain::codex::*;
use crate::error::AppError;
use crate::repositories::codex::CodexRepository as Repo;
use sqlx::SqliteConnection;
use std::collections::HashSet;
use uuid::Uuid;

pub(super) async fn prepare(
    conn: &mut SqliteConnection,
    scope: &CodexScope,
    entity: &str,
    mut categories: Vec<CodexCategoryInput>,
) -> Result<Vec<CodexCategoryInput>, AppError> {
    if categories.len() > 64 || categories.iter().map(|c| c.fields.len()).sum::<usize>() > 256 {
        return Err(invalid(
            "Use no máximo 64 categorias e 256 campos por ficha",
        ));
    }
    let mut ids = HashSet::new();
    for category in &mut categories {
        category.name = label(&category.name)?;
        if let Some(id) = &category.id {
            if Repo::category_owner(conn, id).await?.as_deref() != Some(entity) {
                return Err(invalid("A categoria não pertence a esta ficha"));
            }
        } else {
            category.id = Some(Uuid::now_v7().to_string());
        }
        if !ids.insert(category.id.clone()) {
            return Err(invalid("IDs repetidos na estrutura"));
        }
        for input in &mut category.fields {
            input.label = label(&input.label)?;
            field(input)?;
            if let Some(id) = &input.id {
                if Repo::field_owner(conn, id).await?.as_deref() != Some(entity) {
                    return Err(invalid("O campo não pertence a esta ficha"));
                }
            } else {
                input.id = Some(Uuid::now_v7().to_string());
            }
            if !ids.insert(input.id.clone()) {
                return Err(invalid("IDs repetidos na estrutura"));
            }
            if input.field_type == CodexFieldType::Reference {
                for id in input.value.as_array().expect("validated array") {
                    Repo::entity(conn, scope, id.as_str().expect("validated reference")).await?;
                }
            }
        }
    }
    Ok(categories)
}

impl CodexService<'_> {
    pub async fn save_structure(
        &self,
        input: CodexScopeInput,
        id: &str,
        categories: Vec<CodexCategoryInput>,
    ) -> Result<CodexSheet, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        writable(&scope)?;
        Repo::entity(&mut tx, &scope, id).await?;
        let categories = prepare(&mut tx, &scope, id, categories).await?;
        Repo::replace_structure(&mut tx, id, &categories).await?;
        let sheet = Repo::sheet(&mut tx, &scope, id).await?;
        tx.commit().await?;
        Ok(sheet)
    }
}
