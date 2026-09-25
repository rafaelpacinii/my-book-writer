use crate::domain::catalog::{BookFormat, FontPreset};
use crate::services::catalog_service::CatalogService;
use crate::state::AppState;
use tauri::State;

/// Retorna a lista de formatos de livros ativos disponíveis no catálogo.
/// Invocado pelo frontend: invoke('list_book_formats')
#[tauri::command]
pub async fn list_book_formats(state: State<'_, AppState>) -> Result<Vec<BookFormat>, String> {
    let service = CatalogService::new(&state.db_pool);
    service.list_formats().await.map_err(|e| e.to_string())
}

/// Retorna a lista de presets de fontes ativas disponíveis no catálogo.
/// Invocado pelo frontend: invoke('list_font_presets')
#[tauri::command]
pub async fn list_font_presets(state: State<'_, AppState>) -> Result<Vec<FontPreset>, String> {
    let service = CatalogService::new(&state.db_pool);
    service.list_font_presets().await.map_err(|e| e.to_string())
}
