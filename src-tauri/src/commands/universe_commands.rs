use crate::domain::universe::{CreateUniverseInput, Universe, UpdateUniverseInput};
use crate::services::universe_service::UniverseService;
use crate::state::AppState;
use tauri::State;

/// Cria um novo Universo Literário.
#[tauri::command]
pub async fn create_universe(
    state: State<'_, AppState>,
    input: CreateUniverseInput,
) -> Result<Universe, String> {
    let service = UniverseService::new(&state.db_pool);
    service
        .create_universe(input)
        .await
        .map_err(|e| e.to_string())
}

/// Lista todos os Universos Literários ativos de um perfil.
#[tauri::command]
pub async fn list_universes(
    state: State<'_, AppState>,
    profile_id: String,
) -> Result<Vec<Universe>, String> {
    let service = UniverseService::new(&state.db_pool);
    service
        .list_universes(&profile_id)
        .await
        .map_err(|e| e.to_string())
}

/// Busca um Universo Literário pelo ID.
#[tauri::command]
pub async fn get_universe_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<Universe>, String> {
    let service = UniverseService::new(&state.db_pool);
    service
        .get_universe_by_id(&id)
        .await
        .map_err(|e| e.to_string())
}

/// Atualiza os dados de um Universo Literário.
#[tauri::command]
pub async fn update_universe(
    state: State<'_, AppState>,
    id: String,
    input: UpdateUniverseInput,
) -> Result<Universe, String> {
    let service = UniverseService::new(&state.db_pool);
    service
        .update_universe(&id, input)
        .await
        .map_err(|e| e.to_string())
}

/// Reordena os Universos Literários de um perfil.
#[tauri::command]
pub async fn reorder_universes(
    state: State<'_, AppState>,
    profile_id: String,
    universe_ids: Vec<String>,
) -> Result<(), String> {
    let service = UniverseService::new(&state.db_pool);
    service
        .reorder_universes(&profile_id, &universe_ids)
        .await
        .map_err(|e| e.to_string())
}

/// Exclusão lógica de um Universo Literário.
#[tauri::command]
pub async fn delete_universe(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let service = UniverseService::new(&state.db_pool);
    service
        .delete_universe(&id)
        .await
        .map_err(|e| e.to_string())
}
