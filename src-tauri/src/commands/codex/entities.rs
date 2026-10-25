use super::CodexCommandError;
use crate::domain::codex::*;
use crate::services::codex::CodexService;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn list_codex_entities(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    kind: Option<CodexKind>,
) -> Result<Vec<CodexEntity>, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .list_entities(scope, kind)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn get_codex_sheet(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    id: String,
) -> Result<CodexSheet, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .get_sheet(scope, &id)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn create_codex_entity(
    state: State<'_, AppState>,
    input: CreateCodexEntityInput,
) -> Result<CodexSheet, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .create_entity(input)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn update_codex_entity(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    id: String,
    input: UpdateCodexEntityInput,
) -> Result<CodexEntity, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .update_entity(scope, &id, input)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn delete_codex_entity(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    id: String,
) -> Result<(), CodexCommandError> {
    CodexService::new(&state.db_pool)
        .delete_entity(scope, &id)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn save_codex_structure(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
    id: String,
    categories: Vec<CodexCategoryInput>,
) -> Result<CodexSheet, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .save_structure(scope, &id, categories)
        .await
        .map_err(Into::into)
}
