use super::CodexCommandError;
use crate::domain::codex::*;
use crate::services::codex::CodexService;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn resolve_codex_scope(
    state: State<'_, AppState>,
    scope: CodexScopeInput,
) -> Result<CodexScope, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .resolve_scope(scope)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn list_codex_contexts(
    state: State<'_, AppState>,
    profile_id: String,
) -> Result<Vec<CodexContext>, CodexCommandError> {
    CodexService::new(&state.db_pool)
        .list_scopes(&profile_id)
        .await
        .map_err(Into::into)
}
