use crate::domain::profile::LocalProfile;
use crate::services::profile_service::ProfileService;
use crate::state::AppState;
use tauri::State;

/// Obtém o perfil local ativo do autor.
/// Invocado pelo frontend: invoke('get_profile')
#[tauri::command]
pub async fn get_profile(state: State<'_, AppState>) -> Result<LocalProfile, String> {
    let service = ProfileService::new(&state.db_pool);
    service
        .get_default_profile()
        .await
        .map_err(|e| e.to_string())
}

/// Atualiza o nome de exibição do autor.
/// Invocado pelo frontend: invoke('update_profile', { displayName: "Novo Nome" })
#[tauri::command]
pub async fn update_profile(
    state: State<'_, AppState>,
    display_name: String,
) -> Result<LocalProfile, String> {
    let service = ProfileService::new(&state.db_pool);
    service
        .update_display_name(display_name)
        .await
        .map_err(|e| e.to_string())
}
