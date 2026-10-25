use super::validation::invalid;
use crate::domain::codex::*;
use crate::error::AppError;
use crate::repositories::codex::CodexRepository as Repo;
use serde::Deserialize;
use sqlx::SqliteConnection;
use uuid::Uuid;

#[derive(Deserialize)]
struct Preset {
    kind: CodexKind,
    name: String,
    preset_key: String,
    categories: Vec<CodexCategoryInput>,
}
pub(super) async fn ensure(conn: &mut SqliteConnection, profile: &str) -> Result<(), AppError> {
    Repo::profile(conn, profile).await?;
    let presets: Vec<Preset> =
        serde_json::from_str(include_str!("../../../resources/codex-presets.json"))
            .map_err(|_| invalid("Os modelos iniciais do Códice não puderam ser carregados"))?;
    for preset in presets {
        let schema = serde_json::to_string(&preset.categories)
            .map_err(|_| invalid("Modelo inicial inválido"))?;
        Repo::insert_template(
            conn,
            profile,
            &Uuid::now_v7().to_string(),
            preset.kind.as_str(),
            &preset.name,
            Some(&preset.preset_key),
            &schema,
        )
        .await?;
    }
    Ok(())
}
