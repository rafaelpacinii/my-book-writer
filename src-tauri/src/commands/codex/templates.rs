use super::CodexCommandError;
use crate::domain::codex::*;
use crate::services::codex::CodexService;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn list_codex_templates(
    state: State<'_, AppState>,
    profile_id: String,
    kind: Option<CodexKind>,
) -> Result<Vec<CodexTemplate>, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .list_templates(&profile_id, kind)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn save_codex_template(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    entity_id: String,
    name: String,
) -> Result<CodexTemplate, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .save_template(scope, &entity_id, &name)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn delete_codex_template(
    state: State<'_, AppState>,
    profile_id: String,
    id: String,
) -> Result<(), CodexCommandError> {
    CodexService::new(&state.db_pool)
        .delete_template(&profile_id, &id)
        .await
        .map_err(Into::into)
}
