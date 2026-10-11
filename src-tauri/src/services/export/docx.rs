use crate::error::AppError;
use crate::repositories::book_repository::touch_book;
use crate::repositories::export_repository::{read_snapshot, BookExportSnapshot};
use crate::services::export::{content::chapter_html, output};
use crate::state::AppState;
use docx_rs::*;
use scraper::{ElementRef, Html, Node};
use serde::Serialize;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct DocxExportResult {
    pub path: String,
}

fn um_to_twips(um: i64) -> u32 {
    ((um as f64) * 1440.0 / 25400.0).round().max(1.0) as u32
}

pub fn render_docx(snapshot: &BookExportSnapshot) -> Result<Vec<u8>, AppError> {
    if snapshot.chapters.is_empty() {
        return Err(AppError::Export(
            "Adicione pelo menos um capítulo antes de exportar.".into(),
        ));
    }

    let font_family = &snapshot.font.family_name;
    let font_size_hp = (snapshot.book.font_size_pt * 2.0).round().max(12.0) as usize;
    let line_spacing_val = (snapshot.book.line_height_ratio * 240.0).round().max(240.0) as i32;

    let width_twips = um_to_twips(snapshot.format.width_um);
    let height_twips = um_to_twips(snapshot.format.height_um);

    let margin_top = um_to_twips(snapshot.book.margin_top_um) as i32;
    let margin_bottom = um_to_twips(snapshot.book.margin_bottom_um) as i32;
    let margin_left = um_to_twips(snapshot.book.margin_left_um) as i32;
    let margin_right = um_to_twips(snapshot.book.margin_right_um) as i32;

    let doc = Docx::new()
        .page_size(width_twips, height_twips)
        .page_margin(
            PageMargin::new()
                .top(margin_top)
                .bottom(margin_bottom)
                .left(margin_left)
                .right(margin_right)
                .header(margin_top / 2)
                .footer(margin_bottom / 2),
        )
        .default_fonts(
            RunFonts::new()
                .ascii(font_family)
                .hi_ansi(font_family)
                .cs(font_family),
        )
        .default_size(font_size_hp)
        .header(
            Header::new().add_paragraph(
                Paragraph::new().align(AlignmentType::Center).add_run(
                    Run::new()
                        .add_text(&snapshot.book.title)
                        .fonts(RunFonts::new().ascii(font_family))
                        .size(18),
                ),
            ),
        );

    let content_width_twips = (width_twips as i32 - margin_left - margin_right).max(1000) as u32;
    let (mut doc, has_front_matter) = add_front_matter_docx(
        doc,
        snapshot,
        font_family,
        font_size_hp,
        content_width_twips,
    );

    let mut std_idx = 0;
    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        let heading_label = match chapter.chapter_type.as_str() {
            "standard" => {
                std_idx += 1;
                format!("CAPÍTULO {std_idx:02}")
            }
            "prologue" => "PRÓLOGO".to_string(),
            "preface" => "PREFÁCIO".to_string(),
            "introduction" => "INTRODUÇÃO".to_string(),
            "epilogue" => "EPÍLOGO".to_string(),
            "afterword" => "POSFÁCIO".to_string(),
            "acknowledgments" => "AGRADECIMENTOS".to_string(),
            "custom" => chapter
                .custom_type_name
                .as_deref()
                .filter(|s| !s.trim().is_empty())
                .unwrap_or("CAPÍTULO ESPECIAL")
                .to_uppercase(),
            _ => {
                std_idx += 1;
                format!("CAPÍTULO {std_idx:02}")
            }
        };
        let mut first_p = Paragraph::new().align(AlignmentType::Center);

        if has_front_matter || index > 0 {
            first_p = first_p.add_run(Run::new().add_break(BreakType::Page));
        }

        first_p = first_p.add_run(
            Run::new()
                .add_text(heading_label)
                .bold()
                .fonts(RunFonts::new().ascii(font_family))
                .size(font_size_hp),
        );
        doc = doc.add_paragraph(first_p);

        if !chapter.title.trim().is_empty() {
            let title_size = (font_size_hp as f64 * 1.35).round() as usize;
            let title_p = Paragraph::new().align(AlignmentType::Center).add_run(
                Run::new()
                    .add_text(&chapter.title)
                    .bold()
                    .fonts(RunFonts::new().ascii(font_family))
                    .size(title_size),
            );
            doc = doc.add_paragraph(title_p);
        }

        doc = doc.add_paragraph(Paragraph::new());

        let html_content = chapter_html(&chapter.content_json)?;
        let fragment = Html::parse_fragment(&html_content);

        for child in fragment.root_element().children() {
            if let Some(el) = ElementRef::wrap(child) {
                append_element_to_doc(&mut doc, el, font_family, font_size_hp, line_spacing_val);
            }
        }
    }

    let mut buffer = std::io::Cursor::new(Vec::new());
    doc.build()
        .pack(&mut buffer)
        .map_err(|e| super::export_error("Falha ao gerar o arquivo DOCX.", e))?;

    Ok(buffer.into_inner())
}

fn append_element_to_doc(
    doc: &mut Docx,
    el: ElementRef<'_>,
    font: &str,
    font_size: usize,
    line_spacing: i32,
) {
    let name = el.value().name();

    if el.value().classes().any(|c| c == "scene-break") || name == "hr" {
        let p = Paragraph::new().align(AlignmentType::Center).add_run(
            Run::new()
                .add_text("* * *")
                .bold()
                .fonts(RunFonts::new().ascii(font))
                .size(font_size),
        );
        *doc = std::mem::take(doc).add_paragraph(p);
        return;
    }

    let is_quote = name == "blockquote";
    let is_heading = matches!(name, "h1" | "h2" | "h3");

    let mut p = Paragraph::new().line_spacing(LineSpacing::new().line(line_spacing));

    if is_heading {
        p = p.align(AlignmentType::Center);
    } else if is_quote {
        p = p
            .align(AlignmentType::Both)
            .indent(Some(720), None, None, None);
    } else {
        p = p
            .align(AlignmentType::Both)
            .indent(Some(720), None, None, None);
    }

    let mut runs = Vec::new();
    collect_runs(el, font, font_size, is_quote, false, false, &mut runs);

    if runs.is_empty() {
        return;
    }

    for r in runs {
        p = p.add_run(r);
    }

    *doc = std::mem::take(doc).add_paragraph(p);
}

fn collect_runs(
    el: ElementRef<'_>,
    font: &str,
    font_size: usize,
    inherited_italic: bool,
    inherited_bold: bool,
    inherited_underline: bool,
    runs: &mut Vec<Run>,
) {
    for child in el.children() {
        if let Node::Text(t) = child.value() {
            let text = &t.text;
            if !text.is_empty() {
                let mut run = Run::new()
                    .add_text(text)
                    .fonts(RunFonts::new().ascii(font).hi_ansi(font))
                    .size(font_size);
                if inherited_bold {
                    run = run.bold();
                }
                if inherited_italic {
                    run = run.italic();
                }
                if inherited_underline {
                    run = run.underline("single");
                }
                runs.push(run);
            }
        } else if let Some(child_el) = ElementRef::wrap(child) {
            let tag = child_el.value().name();
            let is_bold = inherited_bold || matches!(tag, "b" | "strong" | "h1" | "h2" | "h3");
            let is_italic = inherited_italic || matches!(tag, "i" | "em" | "blockquote");
            let is_underline = inherited_underline || tag == "u";

            collect_runs(
                child_el,
                font,
                font_size,
                is_italic,
                is_bold,
                is_underline,
                runs,
            );
        }
    }
}

pub async fn export(
    app: tauri::AppHandle,
    state: &AppState,
    book_id: &str,
) -> Result<Option<DocxExportResult>, AppError> {
    let snapshot = read_snapshot(&state.db_pool, book_id).await?;
    let bytes = render_docx(&snapshot)?;
    let filename = suggested_filename(&snapshot.book.title);

    let result = tauri::async_runtime::spawn_blocking(move || {
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
        let destination = chosen
            .into_path()
            .map_err(|e| super::export_error("O destino escolhido não é um arquivo local.", e))?;
        if destination
            .extension()
            .is_none_or(|ext| !ext.eq_ignore_ascii_case("docx"))
        {
            return Err(AppError::Export(
                "O nome do arquivo deve terminar em .docx.".into(),
            ));
        }
        output::save_docx(&destination, &bytes)?;
        Ok(Some(DocxExportResult {
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
    format!("{}.docx", if name.is_empty() { "Livro" } else { name })
}

fn add_front_matter_docx(
    mut doc: Docx,
    snapshot: &BookExportSnapshot,
    font_family: &str,
    font_size_hp: usize,
    content_width_twips: u32,
) -> (Docx, bool) {
    let Some(fm) = &snapshot.front_matter else {
        return (doc, false);
    };
    let mut has_fm = false;
    let mut fm_page_count = 0;
    if fm.include_half_title {
        fm_page_count += 2;
    }
    if fm.include_title_page {
        fm_page_count += 1;
        if fm.include_copyright_page {
            fm_page_count += 1;
        }
    }
    if fm.include_dedication
        && !fm
            .dedication_text
            .as_deref()
            .unwrap_or("")
            .trim()
            .is_empty()
    {
        fm_page_count += 2;
    }
    if fm.include_epigraph && !fm.epigraph_text.as_deref().unwrap_or("").trim().is_empty() {
        fm_page_count += 2;
    }
    if fm.include_table_of_contents {
        fm_page_count += 2;
    }

    if fm.include_half_title {
        has_fm = true;
        let p1 = Paragraph::new().align(AlignmentType::Center).add_run(
            Run::new()
                .add_text(&snapshot.book.title)
                .bold()
                .size(font_size_hp + 8)
                .fonts(RunFonts::new().ascii(font_family)),
        );
        let p2 = Paragraph::new().align(AlignmentType::Center).add_run(
            Run::new()
                .add_text(&snapshot.book.author_name)
                .size(font_size_hp)
                .fonts(RunFonts::new().ascii(font_family)),
        );
        doc = doc.add_paragraph(p1);
        doc = doc.add_paragraph(p2);
        doc = doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
        doc = doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
    }

    if fm.include_title_page {
        has_fm = true;
        let p_title = Paragraph::new().align(AlignmentType::Center).add_run(
            Run::new()
                .add_text(&snapshot.book.title)
                .bold()
                .size(font_size_hp + 12)
                .fonts(RunFonts::new().ascii(font_family)),
        );
        doc = doc.add_paragraph(p_title);

        if let Some(subtitle) = fm.subtitle.as_deref().filter(|s| !s.trim().is_empty()) {
            doc = doc.add_paragraph(
                Paragraph::new().align(AlignmentType::Center).add_run(
                    Run::new()
                        .add_text(subtitle)
                        .italic()
                        .size(font_size_hp + 2)
                        .fonts(RunFonts::new().ascii(font_family)),
                ),
            );
        }
        doc = doc.add_paragraph(Paragraph::new());
        doc = doc.add_paragraph(
            Paragraph::new().align(AlignmentType::Center).add_run(
                Run::new()
                    .add_text(&snapshot.book.author_name)
                    .size(font_size_hp + 4)
                    .fonts(RunFonts::new().ascii(font_family)),
            ),
        );
        doc = doc.add_paragraph(Paragraph::new());

        if let Some(publ) = fm.publisher.as_deref().filter(|s| !s.trim().is_empty()) {
            doc = doc.add_paragraph(
                Paragraph::new().align(AlignmentType::Center).add_run(
                    Run::new()
                        .add_text(publ)
                        .bold()
                        .size(font_size_hp)
                        .fonts(RunFonts::new().ascii(font_family)),
                ),
            );
        }
        let mut city_year = Vec::new();
        if let Some(city) = fm
            .publication_city
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        {
            city_year.push(city.to_string());
        }
        if let Some(year) = fm.publication_year {
            city_year.push(year.to_string());
        }
        if !city_year.is_empty() {
            doc = doc.add_paragraph(
                Paragraph::new().align(AlignmentType::Center).add_run(
                    Run::new()
                        .add_text(city_year.join(" · "))
                        .size(font_size_hp.saturating_sub(2))
                        .fonts(RunFonts::new().ascii(font_family)),
                ),
            );
        }
        doc = doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));

        if fm.include_copyright_page {
            if let Some(text) = fm
                .copyright_text
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(text)
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if !fm.edition.trim().is_empty() {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(&fm.edition)
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if let Some(isbn_p) = fm.isbn_print.as_deref().filter(|s| !s.trim().is_empty()) {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(format!("ISBN (impresso): {isbn_p}"))
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if let Some(isbn_d) = fm.isbn_digital.as_deref().filter(|s| !s.trim().is_empty()) {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(format!("ISBN (digital): {isbn_d}"))
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if let Some(cov) = fm
                .cover_designer
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(format!("Capa: {cov}"))
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if let Some(rev) = fm.proofreader.as_deref().filter(|s| !s.trim().is_empty()) {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(format!("Revisão: {rev}"))
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if let Some(diag) = fm
                .layout_designer
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(format!("Diagramação: {diag}"))
                            .size(font_size_hp.saturating_sub(4))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            if let Some(cat) = fm
                .cataloging_data
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                doc = doc.add_paragraph(
                    Paragraph::new().add_run(
                        Run::new()
                            .add_text(cat)
                            .size(font_size_hp.saturating_sub(6))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            doc =
                doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
        }
    }

    if fm.include_dedication {
        if let Some(text) = fm
            .dedication_text
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        {
            has_fm = true;
            doc = doc.add_paragraph(
                Paragraph::new().align(AlignmentType::Right).add_run(
                    Run::new()
                        .add_text(text)
                        .italic()
                        .size(font_size_hp)
                        .fonts(RunFonts::new().ascii(font_family)),
                ),
            );
            doc =
                doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
            doc =
                doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
        }
    }

    if fm.include_epigraph {
        if let Some(text) = fm.epigraph_text.as_deref().filter(|s| !s.trim().is_empty()) {
            has_fm = true;
            doc = doc.add_paragraph(
                Paragraph::new().align(AlignmentType::Right).add_run(
                    Run::new()
                        .add_text(text)
                        .italic()
                        .size(font_size_hp)
                        .fonts(RunFonts::new().ascii(font_family)),
                ),
            );
            if let Some(author) = fm
                .epigraph_author
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                doc = doc.add_paragraph(
                    Paragraph::new().align(AlignmentType::Right).add_run(
                        Run::new()
                            .add_text(format!("— {author}"))
                            .size(font_size_hp.saturating_sub(2))
                            .fonts(RunFonts::new().ascii(font_family)),
                    ),
                );
            }
            doc =
                doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
            doc =
                doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
        }
    }

    if fm.include_table_of_contents {
        has_fm = true;
        doc = doc.add_paragraph(
            Paragraph::new().align(AlignmentType::Center).add_run(
                Run::new()
                    .add_text("SUMÁRIO")
                    .bold()
                    .size(font_size_hp + 6)
                    .fonts(RunFonts::new().ascii(font_family)),
            ),
        );
        doc = doc.add_paragraph(Paragraph::new());

        let mut est_page = fm_page_count + 1;
        let mut std_idx = 0;
        for chap in &snapshot.chapters {
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
            let mut p = Paragraph::new().add_tab(
                Tab::new()
                    .val(TabValueType::Right)
                    .leader(TabLeaderType::Dot)
                    .pos(content_width_twips as usize),
            );
            p = p.add_run(
                Run::new()
                    .add_text(&label)
                    .size(font_size_hp)
                    .fonts(RunFonts::new().ascii(font_family)),
            );
            p = p.add_run(Run::new().add_tab());
            p = p.add_run(
                Run::new()
                    .add_text(est_page.to_string())
                    .size(font_size_hp)
                    .fonts(RunFonts::new().ascii(font_family)),
            );
            doc = doc.add_paragraph(p);

            let char_count = chap.content_json.len();
            est_page += (char_count / 1500).max(1);
        }
        doc = doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
        doc = doc.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
    }

    (doc, has_fm)
}
