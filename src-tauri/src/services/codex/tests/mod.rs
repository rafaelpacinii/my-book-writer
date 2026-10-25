mod entities;
mod migration;
mod scopes;
mod structure;

use crate::domain::codex::*;
use crate::services::book_service::BookService;
use crate::services::codex::CodexService;
use crate::services::universe_service::UniverseService;
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

pub(super) struct Fixture {
    pub pool: SqlitePool,
    pub book: String,
    pub other_book: String,
    pub profile: String,
    pub universe: String,
}
impl Fixture {
    pub fn service(&self) -> CodexService<'_> {
        CodexService::new(&self.pool)
    }
    pub fn scope(&self) -> CodexScopeInput {
        CodexScopeInput {
            profile_id: self.profile.clone(),
            book_id: Some(self.book.clone()),
            universe_id: None,
        }
    }
    pub fn world(&self) -> CodexScopeInput {
        CodexScopeInput {
            profile_id: self.profile.clone(),
            book_id: None,
            universe_id: Some(self.universe.clone()),
        }
    }
    pub async fn create(&self, kind: CodexKind, name: &str) -> CodexSheet {
        self.service()
            .create_entity(CreateCodexEntityInput {
                scope: self.scope(),
                kind,
                name: name.into(),
                template_id: None,
            })
            .await
            .unwrap()
    }
}
pub(super) async fn fixture() -> Fixture {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    let (profile, format, font): (String, String, String) = sqlx::query_as(
        "SELECT p.id,f.id,t.id FROM local_profiles p,book_formats f,font_presets t LIMIT 1",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    let mut ids = Vec::new();
    for title in ["Livro avulso", "Outro livro"] {
        let input = serde_json::from_value(serde_json::json!({ "profile_id":profile,"format_id":format,"font_preset_id":font,"title":title,"author_name":"Autor" })).unwrap();
        ids.push(BookService::new(&pool).create_book(input).await.unwrap().id);
    }
    let world = UniverseService::new(&pool)
        .create_universe(
            serde_json::from_value(serde_json::json!({ "profile_id":profile,"name":"Mundo" }))
                .unwrap(),
        )
        .await
        .unwrap();
    Fixture {
        pool,
        profile,
        book: ids[0].clone(),
        other_book: ids[1].clone(),
        universe: world.id,
    }
}
pub(super) fn structure(sheet: &CodexSheet) -> Vec<CodexCategoryInput> {
    sheet
        .categories
        .iter()
        .map(|category| CodexCategoryInput {
            id: Some(category.id.clone()),
            name: category.name.clone(),
            fields: sheet
                .fields
                .iter()
                .filter(|field| field.category_id == category.id)
                .map(|field| CodexFieldInput {
                    id: Some(field.id.clone()),
                    label: field.label.clone(),
                    field_type: serde_json::from_value(serde_json::json!(field.field_type))
                        .unwrap(),
                    value: serde_json::from_str(&field.value_json).unwrap(),
                    config: serde_json::from_str(&field.config_json).unwrap(),
                })
                .collect(),
        })
        .collect()
}
