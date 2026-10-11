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

    add_front_matter_epub(&mut builder, snapshot)?;

    let mut std_idx = 0;
    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        let heading_label = match chapter.chapter_type.as_str() {
            "standard" => {
                std_idx += 1;
                format!("Capítulo {std_idx:02}")
            }
            "prologue" => "Prólogo".to_string(),
            "preface" => "Prefácio".to_string(),
            "introduction" => "Introdução".to_string(),
            "epilogue" => "Epílogo".to_string(),
            "afterword" => "Posfácio".to_string(),
            "acknowledgments" => "Agradecimentos".to_string(),
            "custom" => chapter
                .custom_type_name
                .as_deref()
                .filter(|s| !s.trim().is_empty())
                .unwrap_or("Capítulo Especial")
                .to_string(),
            _ => {
                std_idx += 1;
                format!("Capítulo {std_idx:02}")
            }
        };
        let heading_escaped = escape_html(&heading_label);
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
            <span class="chapter-number">{heading_escaped}</span>
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

fn add_front_matter_epub(
    builder: &mut EpubBuilder<ZipLibrary>,
    snapshot: &BookExportSnapshot,
) -> Result<(), AppError> {
    let Some(fm) = &snapshot.front_matter else {
        return Ok(());
    };
    let title_escaped = escape_html(&snapshot.book.title);
    let author_escaped = escape_html(&snapshot.book.author_name);

    if fm.include_half_title {
        let xhtml = format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR" xml:lang="pt-BR">
<head><title>{title_escaped}</title><link rel="stylesheet" href="stylesheet.css" type="text/css" /></head>
<body><section class="half-title-page" style="text-align:center;padding-top:30%;">
    <h1>{title_escaped}</h1><p>{author_escaped}</p>
</section></body></html>"#
        );
        builder
            .add_content(
                EpubContent::new("half_title.xhtml", xhtml.as_bytes())
                    .title("Falsa Folha de Rosto")
                    .reftype(ReferenceType::TitlePage),
            )
            .map_err(|e| {
                super::export_error("Falha ao adicionar falsa folha de rosto ao EPUB.", e)
            })?;
    }

    if fm.include_title_page {
        let subtitle = fm.subtitle.as_deref().unwrap_or("").trim();
        let subtitle_html = if subtitle.is_empty() {
            String::new()
        } else {
            format!(
                "<p style=\"font-style:italic;\">{}</p>",
                escape_html(subtitle)
            )
        };
        let publisher = fm.publisher.as_deref().unwrap_or("").trim();
        let publisher_html = if publisher.is_empty() {
            String::new()
        } else {
            format!(
                "<p style=\"font-weight:bold;\">{}</p>",
                escape_html(publisher)
            )
        };
        let mut year_city = Vec::new();
        if let Some(city) = fm
            .publication_city
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        {
            year_city.push(escape_html(city));
        }
        if let Some(year) = fm.publication_year {
            year_city.push(year.to_string());
        }
        let year_city_html = if year_city.is_empty() {
            String::new()
        } else {
            format!("<p>{}</p>", year_city.join(" · "))
        };

        let xhtml = format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR" xml:lang="pt-BR">
<head><title>{title_escaped}</title><link rel="stylesheet" href="stylesheet.css" type="text/css" /></head>
<body><section class="title-page" style="text-align:center;padding-top:20%;">
    <h1>{title_escaped}</h1>{subtitle_html}
    <p style="margin-top:2em;">{author_escaped}</p>
    <div style="margin-top:3em;">{publisher_html}{year_city_html}</div>
</section></body></html>"#
        );
        builder
            .add_content(
                EpubContent::new("title_page.xhtml", xhtml.as_bytes())
                    .title("Folha de Rosto")
                    .reftype(ReferenceType::TitlePage),
            )
            .map_err(|e| super::export_error("Falha ao adicionar folha de rosto ao EPUB.", e))?;

        if fm.include_copyright_page {
            let mut cp_lines = Vec::new();
            if let Some(text) = fm
                .copyright_text
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!("<p>{}</p>", escape_html(text)));
            }
            if !fm.edition.trim().is_empty() {
                cp_lines.push(format!("<p>{}</p>", escape_html(&fm.edition)));
            }
            if let Some(isbn_p) = fm.isbn_print.as_deref().filter(|s| !s.trim().is_empty()) {
                cp_lines.push(format!("<p>ISBN (impresso): {}</p>", escape_html(isbn_p)));
            }
            if let Some(isbn_d) = fm.isbn_digital.as_deref().filter(|s| !s.trim().is_empty()) {
                cp_lines.push(format!("<p>ISBN (digital): {}</p>", escape_html(isbn_d)));
            }
            if let Some(cov) = fm
                .cover_designer
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!("<p>Capa: {}</p>", escape_html(cov)));
            }
            if let Some(rev) = fm.proofreader.as_deref().filter(|s| !s.trim().is_empty()) {
                cp_lines.push(format!("<p>Revisão: {}</p>", escape_html(rev)));
            }
            if let Some(diag) = fm
                .layout_designer
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!("<p>Diagramação: {}</p>", escape_html(diag)));
            }
            if let Some(cat) = fm
                .cataloging_data
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!(
                    "<div style=\"border:1px solid #ccc;padding:8px;font-family:monospace;font-size:0.8em;\"><pre>{}</pre></div>",
                    escape_html(cat)
                ));
            }
            let xhtml = format!(
                r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR" xml:lang="pt-BR">
<head><title>Copyright</title><link rel="stylesheet" href="stylesheet.css" type="text/css" /></head>
<body><section class="copyright-page" style="font-size:0.85em;padding-top:35%;">
    {}
</section></body></html>"#,
                cp_lines.join("")
            );
            builder
                .add_content(
                    EpubContent::new("copyright.xhtml", xhtml.as_bytes())
                        .title("Copyright")
                        .reftype(ReferenceType::Copyright),
                )
                .map_err(|e| super::export_error("Falha ao adicionar copyright ao EPUB.", e))?;
        }
    }

    if fm.include_dedication {
        if let Some(text) = fm
            .dedication_text
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        {
            let xhtml = format!(
                r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR" xml:lang="pt-BR">
<head><title>Dedicatória</title><link rel="stylesheet" href="stylesheet.css" type="text/css" /></head>
<body><section class="dedication-page" style="text-align:right;font-style:italic;padding-top:30%;">
    <p>{}</p>
</section></body></html>"#,
                escape_html(text)
            );
            builder
                .add_content(
                    EpubContent::new("dedication.xhtml", xhtml.as_bytes()).title("Dedicatória"),
                )
                .map_err(|e| super::export_error("Falha ao adicionar dedicatória ao EPUB.", e))?;
        }
    }

    if fm.include_epigraph {
        if let Some(text) = fm.epigraph_text.as_deref().filter(|s| !s.trim().is_empty()) {
            let author_line = fm
                .epigraph_author
                .as_deref()
                .filter(|s| !s.trim().is_empty())
                .map(|a| format!("<p style=\"font-style:normal;\">— {}</p>", escape_html(a)))
                .unwrap_or_default();
            let xhtml = format!(
                r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR" xml:lang="pt-BR">
<head><title>Epígrafe</title><link rel="stylesheet" href="stylesheet.css" type="text/css" /></head>
<body><section class="epigraph-page" style="text-align:right;font-style:italic;padding-top:30%;">
    <blockquote>{}</blockquote>{}
</section></body></html>"#,
                escape_html(text),
                author_line
            );
            builder
                .add_content(EpubContent::new("epigraph.xhtml", xhtml.as_bytes()).title("Epígrafe"))
                .map_err(|e| super::export_error("Falha ao adicionar epígrafe ao EPUB.", e))?;
        }
    }

    if fm.include_table_of_contents {
        let mut links = String::new();
        let mut std_idx = 0;
        for (i, chap) in snapshot.chapters.iter().enumerate() {
            let label = if chap.chapter_type == "standard" {
                std_idx += 1;
                if chap.title.trim().is_empty() {
                    format!("Capítulo {std_idx:02}")
                } else {
                    format!("Capítulo {std_idx:02} · {}", chap.title)
                }
            } else {
                chap.title.clone()
            };
            let chapter_num = i + 1;
            links.push_str(&format!(
                "<li><a href=\"chapter_{chapter_num}.xhtml\">{}</a></li>",
                escape_html(&label)
            ));
        }
        let xhtml = format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR" xml:lang="pt-BR">
<head><title>Sumário</title><link rel="stylesheet" href="stylesheet.css" type="text/css" /></head>
<body><nav epub:type="toc"><h2 style="text-align:center;margin-bottom:2em;">Sumário</h2><ol style="list-style:none;padding:0;line-height:2;">{links}</ol></nav></body></html>"#
        );
        builder
            .add_content(
                EpubContent::new("toc.xhtml", xhtml.as_bytes())
                    .title("Sumário")
                    .reftype(ReferenceType::Toc),
            )
            .map_err(|e| super::export_error("Falha ao adicionar sumário ao EPUB.", e))?;
    }

    Ok(())
}
