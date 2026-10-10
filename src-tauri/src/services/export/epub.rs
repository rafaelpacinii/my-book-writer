use crate::error::AppError;
use crate::repositories::book_repository::touch_book;
use crate::repositories::export_repository::{read_snapshot, BookExportSnapshot};
use crate::services::export::{
    content::{chapter_html, escape_html},
    output,
};
use crate::state::AppState;
use epub_builder::{EpubBuilder, EpubContent, ReferenceType, ZipLibrary};
use serde::Serialize;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct EpubExportResult {
    pub path: String,
}

pub fn render_epub(snapshot: &BookExportSnapshot) -> Result<Vec<u8>, AppError> {
    if snapshot.chapters.is_empty() {
        return Err(AppError::Export(
            "Adicione pelo menos um capítulo antes de exportar.".into(),
        ));
    }

    let mut builder = EpubBuilder::new(
        ZipLibrary::new()
            .map_err(|e| super::export_error("Falha ao inicializar gerador de EPUB.", e))?,
    )
    .map_err(|e| super::export_error("Falha ao configurar gerador de EPUB.", e))?;

    builder
        .metadata("author", &snapshot.book.author_name)
        .map_err(|e| super::export_error("Falha ao definir autor do livro.", e))?;
    builder
        .metadata("title", &snapshot.book.title)
        .map_err(|e| super::export_error("Falha ao definir título do livro.", e))?;
    builder
        .metadata("lang", "pt-BR")
        .map_err(|e| super::export_error("Falha ao definir idioma do livro.", e))?;

    let css = r#"
        body { font-family: serif; font-size: 1em; line-height: 1.5; color: #292D28; margin: 5%; }
        h1, h2, h3 { font-family: sans-serif; line-height: 1.25; margin-top: 1.5em; margin-bottom: 0.5em; }
        h2 { font-size: 1.5em; text-align: center; }
        .chapter-heading { text-align: center; margin-bottom: 2em; }
        .chapter-number { display: block; font-size: 0.85em; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #64695F; margin-bottom: 0.25em; }
        p { margin: 0 0 1em; text-indent: 0; }
        blockquote { border-left: 3px solid #52664E; padding-left: 1em; margin: 1.25em 0; font-style: italic; color: #64695F; }
        .scene-break { text-align: center; margin: 2em 0; letter-spacing: 0.35em; color: #64695F; font-weight: bold; }
    "#;

    builder
        .stylesheet(css.as_bytes())
        .map_err(|e| super::export_error("Falha ao adicionar folha de estilo.", e))?;

    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        let content_html = chapter_html(&chapter.content_json)?;
        let title_escaped = escape_html(&chapter.title);
        let chapter_num = index + 1;
        let xhtml = format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR" xml:lang="pt-BR">
<head>
    <title>{title_escaped}</title>
    <link rel="stylesheet" href="stylesheet.css" type="text/css" />
</head>
<body>
    <section class="chapter" epub:type="chapter">
        <div class="chapter-heading">
            <span class="chapter-number">Capítulo {chapter_num:02}</span>
            <h2>{title_escaped}</h2>
        </div>
        <div class="chapter-body">
            {content_html}
        </div>
    </section>
</body>
</html>"#
        );

        let filename = format!("chapter_{chapter_num:03}.xhtml");
        builder
            .add_content(
                EpubContent::new(filename, xhtml.as_bytes())
                    .title(&chapter.title)
                    .reftype(ReferenceType::Text),
            )
            .map_err(|e| super::export_error("Falha ao adicionar capítulo ao EPUB.", e))?;
    }

    let mut output = Vec::new();
    builder
        .generate(&mut output)
        .map_err(|e| super::export_error("Falha ao empacotar arquivo EPUB.", e))?;

    Ok(output)
}

pub async fn export(
    app: tauri::AppHandle,
    state: &AppState,
    book_id: &str,
) -> Result<Option<EpubExportResult>, AppError> {
    let snapshot = read_snapshot(&state.db_pool, book_id).await?;
    let bytes = render_epub(&snapshot)?;
    let filename = suggested_filename(&snapshot.book.title);

    let result = tauri::async_runtime::spawn_blocking(move || {
        let Some(chosen) = app
            .dialog()
            .file()
            .set_title("Exportar livro em EPUB")
            .add_filter("eBook EPUB", &["epub"])
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
            .is_none_or(|ext| !ext.eq_ignore_ascii_case("epub"))
        {
            return Err(AppError::Export(
                "O nome do arquivo deve terminar em .epub.".into(),
            ));
        }
        output::save_epub(&destination, &bytes)?;
        Ok(Some(EpubExportResult {
            path: destination.to_string_lossy().into_owned(),
        }))
    })
    .await
    .map_err(|e| super::export_error("A exportação foi interrompida. Tente novamente.", e))??;

    if result.is_some() {
        touch_book(&state.db_pool, book_id).await?;
    }
    Ok(result)
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
    format!("{}.epub", if name.is_empty() { "Livro" } else { name })
}
