use crate::error::AppError;
use crate::repositories::export_repository::{read_snapshot, BookExportSnapshot};
use crate::state::AppState;
use serde::Serialize;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct DocxExportResult {
    pub path: String,
    pub warning: Option<String>,
}

pub fn render_docx(snapshot: &BookExportSnapshot) -> Result<Vec<u8>, AppError> {
    super::docx_render::render(snapshot)
}

pub async fn export(
    app: tauri::AppHandle,
    state: &AppState,
    book_id: &str,
) -> Result<Option<DocxExportResult>, AppError> {
    let snapshot = read_snapshot(&state.db_pool, book_id).await?;
    let filename = super::output::suggested_filename(&snapshot.book.title, "docx");
    let mut result = tauri::async_runtime::spawn_blocking(
        move || -> Result<Option<DocxExportResult>, AppError> {
            super::validation::validate(&snapshot, super::validation::ExportFormat::Docx)?;
            let Some(chosen) = app
                .dialog()
                .file()
                .set_title("Exportar livro em DOCX")
                .add_filter("Documento Word (.docx)", &["docx"])
                .set_file_name(filename)
                .blocking_save_file()
            else {
                return Ok(None);
            };
            let destination = chosen.into_path().map_err(|error| {
                super::export_error("O destino escolhido não é um arquivo local.", error)
            })?;
            super::output::validate_extension(&destination, "docx")?;
            let bytes = render_docx(&snapshot)?;
            super::output::save_docx(&destination, &bytes)?;
            Ok(Some(DocxExportResult {
                path: destination.to_string_lossy().into_owned(),
                warning: None,
            }))
        },
    )
    .await
    .map_err(|error| {
        super::export_error("A exportação foi interrompida. Tente novamente.", error)
    })??;
    if let Some(saved) = &mut result {
        saved.warning = super::output::record_saved(&state.db_pool, book_id).await;
    }
    Ok(result)
}
