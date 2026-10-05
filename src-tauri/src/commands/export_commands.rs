use crate::services::export::pdf::{self, PdfExportInfo, PdfExportResult};
use crate::state::AppState;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn get_pdf_export_info(
    app: AppHandle,
    state: State<'_, AppState>,
    book_id: String,
) -> Result<PdfExportInfo, String> {
    pdf::info(&app, &state, &book_id)
        .await
        .map_err(crate::services::export::frontend_error)
}

#[tauri::command]
pub async fn export_book_pdf(
    app: AppHandle,
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Option<PdfExportResult>, String> {
    pdf::export(app, &state, &book_id)
        .await
        .map_err(crate::services::export::frontend_error)
}
