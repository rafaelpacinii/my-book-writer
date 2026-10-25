use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CodexEntity {
    #[sqlx(default)]
    pub primary_image_id: Option<String>,
    pub id: String,
    pub profile_id: String,
    pub book_id: Option<String>,
    pub universe_id: Option<String>,
    pub kind: String,
    pub name: String,
    pub summary: Option<String>,
    pub role: Option<String>,
    pub status: Option<String>,
    pub archetype: Option<String>,
    pub tags_json: String,
    pub position: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CodexCategory {
    pub id: String,
    pub entity_id: String,
    pub name: String,
    pub position: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CodexField {
    pub id: String,
    pub category_id: String,
    pub label: String,
    pub field_type: String,
    pub value_json: String,
    pub config_json: String,
    pub position: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CodexImage {
    pub id: String,
    pub entity_id: String,
    pub image_asset_id: String,
    pub caption: Option<String>,
    pub is_primary: bool,
    pub position: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CodexTemplate {
    pub id: String,
    pub profile_id: String,
    pub kind: String,
    pub name: String,
    pub preset_key: Option<String>,
    pub schema_json: String,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexSheet {
    pub entity: CodexEntity,
    pub categories: Vec<CodexCategory>,
    pub fields: Vec<CodexField>,
    pub images: Vec<CodexImage>,
}
