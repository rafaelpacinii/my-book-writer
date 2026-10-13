use crate::domain::chapter::Chapter;
use crate::domain::chapter_version::{ChapterVersion, ChapterVersionSummary};
use crate::services::chapter_version_service::ChapterVersionService;
use crate::state::AppState;
use tauri::State;

/// Cria um snapshot manual ou automático para o capítulo
#[tauri::command]
pub async fn create_chapter_version(
    state: State<'_, AppState>,
    chapter_id: String,
    description: Option<String>,
) -> Result<ChapterVersion, String> {
    let service = ChapterVersionService::new(&state.db_pool);
    service
        .create_version(&chapter_id, description.as_deref())
        .await
        .map_err(|e| e.to_string())
}

/// Lista todas as versões de um capítulo
#[tauri::command]
pub async fn list_chapter_versions(
    state: State<'_, AppState>,
    chapter_id: String,
) -> Result<Vec<ChapterVersionSummary>, String> {
    let service = ChapterVersionService::new(&state.db_pool);
    service
        .list_versions(&chapter_id)
        .await
        .map_err(|e| e.to_string())
}

/// Obtém os dados completos de uma versão específica
#[tauri::command]
pub async fn get_chapter_version(
    state: State<'_, AppState>,
    version_id: String,
) -> Result<Option<ChapterVersion>, String> {
    let service = ChapterVersionService::new(&state.db_pool);
    service
        .get_version(&version_id)
        .await
        .map_err(|e| e.to_string())
}

/// Restaura o capítulo para o conteúdo de uma versão histórica
#[tauri::command]
pub async fn restore_chapter_version(
    state: State<'_, AppState>,
    chapter_id: String,
    version_id: String,
) -> Result<Chapter, String> {
    let service = ChapterVersionService::new(&state.db_pool);
    service
        .restore_version(&chapter_id, &version_id)
        .await
        .map_err(|e| e.to_string())
}

/// Exclui um snapshot do histórico
#[tauri::command]
pub async fn delete_chapter_version(
    state: State<'_, AppState>,
    version_id: String,
) -> Result<bool, String> {
    let service = ChapterVersionService::new(&state.db_pool);
    service
        .delete_version(&version_id)
        .await
        .map_err(|e| e.to_string())
}

/// Ativa ou desativa o rastreamento de alterações do capítulo
#[tauri::command]
pub async fn set_chapter_track_changes(
    state: State<'_, AppState>,
    chapter_id: String,
    enabled: bool,
) -> Result<Chapter, String> {
    let service = ChapterVersionService::new(&state.db_pool);
    service
        .set_track_changes(&chapter_id, enabled)
        .await
        .map_err(|e| e.to_string())
}
