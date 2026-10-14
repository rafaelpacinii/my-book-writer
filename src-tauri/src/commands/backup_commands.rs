use crate::domain::backup::{BackupExportResult, BackupImportResult, DatabaseStats};
use crate::services::backup_service::BackupService;
use crate::state::AppState;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn get_database_stats(state: State<'_, AppState>) -> Result<DatabaseStats, String> {
    let service = BackupService::new(&state.db_pool, &state.storage_dir);
    service
        .get_database_stats()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_database_backup(
    app: AppHandle,
    state: State<'_, AppState>,
    custom_path: Option<String>,
) -> Result<Option<BackupExportResult>, String> {
    let service = BackupService::new(&state.db_pool, &state.storage_dir);
    service
        .export_backup(&app, custom_path)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn import_database_backup(
    app: AppHandle,
    state: State<'_, AppState>,
    custom_path: Option<String>,
) -> Result<Option<BackupImportResult>, String> {
    let service = BackupService::new(&state.db_pool, &state.storage_dir);
    service
        .import_backup(&app, custom_path)
        .await
        .map_err(|e| e.to_string())
}
