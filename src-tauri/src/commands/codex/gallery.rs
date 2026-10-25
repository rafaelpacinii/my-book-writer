use super::CodexCommandError;
use crate::{domain::codex::*, services::codex::CodexService, state::AppState};
use tauri::State;

#[tauri::command]
pub async fn import_codex_image(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    entity_id: String,
    input: ImportCodexImageInput,
) -> Result<CodexSheet, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .import_image(&state.storage_dir, scope, &entity_id, input)
        .await
        .map_err(Into::into)
}
#[tauri::command]
pub async fn read_codex_image(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    entity_id: String,
    image_id: String,
) -> Result<String, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .read_image(&state.storage_dir, scope, &entity_id, &image_id)
        .await
        .map_err(Into::into)
}
#[tauri::command]
pub async fn update_codex_image(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    entity_id: String,
    image_id: String,
    input: UpdateCodexImageInput,
) -> Result<CodexSheet, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .update_image(scope, &entity_id, &image_id, input)
        .await
        .map_err(Into::into)
}
#[tauri::command]
pub async fn delete_codex_image(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    entity_id: String,
    image_id: String,
) -> Result<CodexSheet, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .delete_image(scope, &entity_id, &image_id)
        .await
        .map_err(Into::into)
}
