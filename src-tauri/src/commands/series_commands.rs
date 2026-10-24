use crate::domain::book::Book;
use crate::domain::series::{BookSeries, CreateSeriesInput, UpdateSeriesInput};
use crate::services::series_service::SeriesService;
use crate::state::AppState;
use tauri::State;

/// Cria uma nova Série de Livros.
#[tauri::command]
pub async fn create_series(
    state: State<'_, AppState>,
    input: CreateSeriesInput,
) -> Result<BookSeries, String> {
    let service = SeriesService::new(&state.db_pool);
    service
        .create_series(input)
        .await
        .map_err(|e| e.to_string())
}

/// Lista todas as Séries de Livros ativas de um perfil.
#[tauri::command]
pub async fn list_series(
    state: State<'_, AppState>,
    profile_id: String,
) -> Result<Vec<BookSeries>, String> {
    let service = SeriesService::new(&state.db_pool);
    service
        .list_series(&profile_id)
        .await
        .map_err(|e| e.to_string())
}

/// Busca uma Série de Livros pelo ID.
#[tauri::command]
pub async fn get_series_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<BookSeries>, String> {
    let service = SeriesService::new(&state.db_pool);
    service
        .get_series_by_id(&id)
        .await
        .map_err(|e| e.to_string())
}

/// Atualiza os metadados ou o vínculo de Universo de uma Série.
#[tauri::command]
pub async fn update_series(
    state: State<'_, AppState>,
    id: String,
    input: UpdateSeriesInput,
) -> Result<BookSeries, String> {
    let service = SeriesService::new(&state.db_pool);
    service
        .update_series(&id, input)
        .await
        .map_err(|e| e.to_string())
}

/// Reordena a lista de Séries de um perfil.
#[tauri::command]
pub async fn reorder_series(
    state: State<'_, AppState>,
    profile_id: String,
    series_ids: Vec<String>,
) -> Result<(), String> {
    let service = SeriesService::new(&state.db_pool);
    service
        .reorder_series(&profile_id, &series_ids)
        .await
        .map_err(|e| e.to_string())
}

/// Reordena os livros dentro de uma Série, recalculando automaticamente os volumes (1..N).
#[tauri::command]
pub async fn reorder_series_books(
    state: State<'_, AppState>,
    series_id: String,
    book_ids: Vec<String>,
) -> Result<Vec<Book>, String> {
    let service = SeriesService::new(&state.db_pool);
    service
        .reorder_series_books(&series_id, &book_ids)
        .await
        .map_err(|e| e.to_string())
}

/// Exclusão lógica de uma Série de Livros.
#[tauri::command]
pub async fn delete_series(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let service = SeriesService::new(&state.db_pool);
    service.delete_series(&id).await.map_err(|e| e.to_string())
}

