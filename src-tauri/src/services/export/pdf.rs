use super::{chromium, html, output};
use crate::error::AppError;
use crate::repositories::export_repository::read_snapshot;
use crate::state::AppState;
use serde::Serialize;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct PdfExportInfo {
    pub title: String,
    pub author: String,
    pub format_name: String,
    pub font_name: String,
    pub chapter_count: usize,
    pub available: bool,
    pub unavailable_reason: Option<String>,
}

#[derive(Serialize)]
pub struct PdfExportResult {
    pub path: String,
}

fn resource_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, AppError> {
    #[cfg(debug_assertions)]
    {
        let development = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("resources");
        if development.join("chromium/manifest.json").is_file() {
            return Ok(development);
        }
    }
    app.path().resource_dir().map_err(|e| {
        super::export_error("Não foi possível localizar os recursos do aplicativo.", e)
    })
}

pub async fn info(
    app: &tauri::AppHandle,
    state: &AppState,
    book_id: &str,
) -> Result<PdfExportInfo, AppError> {
    let snapshot = read_snapshot(&state.db_pool, book_id).await?;
    let readiness = resource_dir(app)
        .and_then(|root| chromium::executable(&root))
        .map(|_| ());
    let unavailable_reason = readiness.err().map(|error| error.to_string());
    Ok(PdfExportInfo {
        title: snapshot.book.title,
        author: snapshot.book.author_name,
        format_name: snapshot.format.name,
        font_name: snapshot.font.name,
        chapter_count: snapshot.chapters.len(),
        available: unavailable_reason.is_none(),
        unavailable_reason,
    })
}

pub async fn export(
    app: tauri::AppHandle,
    state: &AppState,
    book_id: &str,
) -> Result<Option<PdfExportResult>, AppError> {
    let snapshot = read_snapshot(&state.db_pool, book_id).await?;
    let binary = chromium::executable(&resource_dir(&app)?)?;
    let document = html::render_book(&snapshot)?;
    let filename = suggested_filename(&snapshot.book.title);
    tauri::async_runtime::spawn_blocking(move || {
        let Some(chosen) = app
            .dialog()
            .file()
            .set_title("Exportar livro em PDF")
            .add_filter("Documento PDF", &["pdf"])
            .set_file_name(filename)
            .blocking_save_file()
        else {
            return Ok(None);
        };
        let destination = chosen
            .into_path()
            .map_err(|e| super::export_error("O destino escolhido não é um arquivo local.", e))?;
        if destination
            .extension()
            .is_none_or(|extension| !extension.eq_ignore_ascii_case("pdf"))
        {
            return Err(AppError::Export(
                "O nome do arquivo deve terminar em .pdf.".into(),
            ));
        }
        let bytes = chromium::render_pdf(&binary, &document)?;
        output::save_pdf(&destination, &bytes)?;
        Ok(Some(PdfExportResult {
            path: destination.to_string_lossy().into_owned(),
        }))
    })
    .await
    .map_err(|e| super::export_error("A exportação foi interrompida. Tente novamente.", e))?
}

fn suggested_filename(title: &str) -> String {
    let name: String = title
        .chars()
        .map(|character| {
            if character.is_control() || "<>:\"/\\|?*".contains(character) {
                '_'
            } else {
                character
            }
        })
        .take(100)
        .collect();
    let name = name.trim().trim_matches('.');
    format!("{}.pdf", if name.is_empty() { "Livro" } else { name })
}
