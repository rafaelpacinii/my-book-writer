use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::FromRow;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum CodexKind {
    Character,
    Location,
    Lore,
}
impl CodexKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Character => "character",
            Self::Location => "location",
            Self::Lore => "lore",
        }
    }
}
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum CodexFieldType {
    ShortText,
    LongText,
    Tags,
    Scale,
    Reference,
    Document,
}
impl CodexFieldType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::ShortText => "short_text",
            Self::LongText => "long_text",
            Self::Tags => "tags",
            Self::Scale => "scale",
            Self::Reference => "reference",
            Self::Document => "document",
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexScopeInput {
    pub profile_id: String,
    pub book_id: Option<String>,
    pub universe_id: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexScope {
    pub profile_id: String,
    pub book_id: Option<String>,
    pub universe_id: Option<String>,
    pub is_archived: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CodexContext {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub is_archived: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexFieldInput {
    pub id: Option<String>,
    pub label: String,
    pub field_type: CodexFieldType,
    pub value: Value,
    pub config: Value,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexCategoryInput {
    pub id: Option<String>,
    pub name: String,
    pub fields: Vec<CodexFieldInput>,
}
#[derive(Debug, Clone, Deserialize)]
pub struct CreateCodexEntityInput {
    pub scope: CodexScopeInput,
    pub kind: CodexKind,
    pub name: String,
    pub template_id: Option<String>,
}
#[derive(Debug, Clone, Default, Deserialize)]
pub struct UpdateCodexEntityInput {
    pub name: Option<String>,
    pub summary: Option<String>,
    pub role: Option<String>,
    pub status: Option<String>,
    pub archetype: Option<String>,
    pub tags: Option<Vec<String>>,
}
