use super::{content::escape_html, fonts::font_css};
use crate::error::AppError;
use crate::repositories::export_repository::BookExportSnapshot;

pub fn render_book(snapshot: &BookExportSnapshot) -> Result<String, AppError> {
    super::validation::validate(snapshot, super::validation::ExportFormat::Pdf)?;
    let book = &snapshot.book;
    let font = font_css(&snapshot.font.family_name)?;
    let title = escape_html(&book.title);
    let author = escape_html(&book.author_name);
    let front_matter_html = render_front_matter(snapshot);

    let mut chapters = String::new();
    let mut std_idx = 0;
    for (idx, chapter) in snapshot.chapters.iter().enumerate() {
        let is_special = chapter.chapter_type != "standard";
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
        let html = super::validation::chapter_content(chapter, idx)?;
        let heading_html = if is_special {
            format!("<h2>{}</h2>", escape_html(&chapter.title))
        } else {
            format!(
                "<span>{}</span><h2>{}</h2>",
                escape_html(&heading_label),
                escape_html(&chapter.title)
            )
        };
        chapters.push_str(&format!(
            "<section id=\"chapter-{idx}\" class=\"chapter\"><div class=\"paged-chapter-heading\">{heading_html}</div><div class=\"editor-content editor-content-paged\">{html}</div></section>",
        ));
    }

    let mm = |value: i64| value as f64 / 1000.0;
    let running_mm = book.font_size_pt * 2.0 * 25.4 / 72.0;
    let header = css_string(&book.title);
    let typography = include_str!("../../../../src/lib/editor/bookTypography.css");
    let css = format!(
        r#"
        {font}
        * {{ box-sizing: border-box; }}
        @page {{
            size: {width}mm {height}mm;
            margin: {top}mm {right}mm {bottom}mm {left}mm;
            @top-center {{ content: {header}; font-family: '{family}'; font-size: 6.75pt;
                text-transform: uppercase; letter-spacing: .1em; vertical-align: bottom;
                padding-bottom: {header_space}mm; }}
            @bottom-center {{ content: counter(page); font-family: '{family}'; font-size: 7.5pt;
                vertical-align: top; padding-top: 2mm; }}
        }}
        @page front-matter {{
            size: {width}mm {height}mm;
            margin: {top}mm {right}mm {bottom}mm {left}mm;
            @top-center {{ content: none; }}
            @bottom-center {{ content: none; }}
        }}
        html, body {{ margin: 0; padding: 0; }}
        body {{ font-family: '{family}'; font-size: {size}pt; line-height: {line_height}; color: #292D28; }}
        .chapter + .chapter {{ break-before: page; }}
        .front-matter-page {{ page: front-matter; break-before: page; min-height: 85vh; display: flex; flex-direction: column; }}
        .half-title-page {{ justify-content: center; align-items: center; text-align: center; }}
        .title-page {{ justify-content: space-between; align-items: center; text-align: center; padding: 2em 0; }}
        .copyright-page {{ justify-content: flex-end; font-size: 8pt; line-height: 1.4; padding-bottom: 1em; }}
        .dedication-page, .epigraph-page {{ justify-content: center; align-items: flex-end; text-align: right; font-style: italic; padding-right: 12%; }}
        .toc-page {{ justify-content: flex-start; }}
        .toc-heading {{ text-align: center; font-size: 14pt; font-weight: 400; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 24pt; }}
        .toc-list {{ width: 100%; }}
        .toc-entry {{ margin-bottom: 8pt; }}
        .toc-entry a {{ display: flex; align-items: baseline; justify-content: space-between; text-decoration: none; color: inherit; font-size: 10pt; }}
        .toc-dots {{ flex: 1; border-bottom: 1pt dotted #64695F; margin: 0 6pt; }}
        .toc-num {{ font-size: 9pt; font-variant-numeric: tabular-nums; }}
        .blank-page {{ visibility: hidden; }}
        .paged-chapter-heading span {{ display: block; font-size: 7.5pt; font-weight: 700;
            text-transform: uppercase; letter-spacing: .025em; margin-bottom: 3pt; }}
        .paged-chapter-heading h2 {{ font-size: 15pt; font-weight: 400; margin: 0 0 9pt; line-height: 1.4; }}
        .editor-content blockquote {{ border-left: 2.25pt solid #52664E; padding-left: 12pt;
            margin: 15pt 0; font-style: italic; color: #64695F; }}
        .editor-content .scene-break {{ text-align: center; margin: 24pt 0; letter-spacing: .35em;
            color: #64695F; font-weight: 700; }}
        a {{ color: inherit; }}
        .editor-content img {{ max-width: 100%; max-height: {image_height}mm; height: auto; object-fit: contain; break-inside: avoid; }}
        .editor-content table {{ width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 1.25em; }}
        .editor-content th, .editor-content td {{ border: .5pt solid #64695F; padding: 4pt; overflow-wrap: anywhere; vertical-align: top; }}
        .editor-content thead {{ display: table-header-group; }}
        .editor-content tr {{ break-inside: avoid; }}
        {typography}
    "#,
        width = mm(snapshot.format.width_um),
        height = mm(snapshot.format.height_um),
        top = mm(book.margin_top_um) + running_mm,
        bottom = mm(book.margin_bottom_um) + running_mm,
        left = mm(book.margin_left_um),
        right = mm(book.margin_right_um),
        header_space = running_mm * 0.5,
        family = snapshot.font.family_name,
        size = book.font_size_pt,
        line_height = book.line_height_ratio,
        image_height = mm(snapshot.format.height_um - book.margin_top_um - book.margin_bottom_um)
            - running_mm * 2.0
            - book.font_size_pt * book.line_height_ratio * 25.4 / 72.0,
    );

    Ok(format!(
        "<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:;\"><meta name=\"author\" content=\"{author}\"><title>{title}</title><style>{css}</style></head><body>{front_matter_html}{chapters}</body></html>"
    ))
}

pub(super) fn render_front_matter(snapshot: &BookExportSnapshot) -> String {
    let Some(fm) = &snapshot.front_matter else {
        return String::new();
    };
    let book = &snapshot.book;
    let title = escape_html(&book.title);
    let author = escape_html(&book.author_name);
    let mut html = String::new();

    if fm.include_half_title {
        html.push_str(&format!(
            "<section class=\"front-matter-page half-title-page\"><div><h1 style=\"font-size:18pt;font-weight:400;margin:0 0 12pt;\">{title}</h1><p style=\"font-size:11pt;color:#64695F;margin:0;\">{author}</p></div></section><section class=\"front-matter-page blank-page\"></section>"
        ));
    }

    if fm.include_title_page {
        let subtitle = fm.subtitle.as_deref().unwrap_or("").trim();
        let subtitle_html = if subtitle.is_empty() {
            String::new()
        } else {
            format!(
                "<p style=\"font-size:12pt;font-style:italic;color:#64695F;margin:6pt 0 0;\">{}</p>",
                escape_html(subtitle)
            )
        };
        let publisher = fm.publisher.as_deref().unwrap_or("").trim();
        let publisher_html = if publisher.is_empty() {
            String::new()
        } else {
            format!(
                "<p style=\"font-size:10pt;font-weight:700;margin:0;\">{}</p>",
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
            format!(
                "<p style=\"font-size:9pt;color:#64695F;margin:4pt 0 0;\">{}</p>",
                year_city.join(" · ")
            )
        };

        html.push_str(&format!(
            "<section class=\"front-matter-page title-page\"><div><h1 style=\"font-size:22pt;font-weight:400;margin:0;\">{title}</h1>{subtitle_html}</div><div><p style=\"font-size:13pt;margin:0;\">{author}</p></div><div>{publisher_html}{year_city_html}</div></section>"
        ));

        if fm.include_copyright_page {
            let mut cp_lines = Vec::new();
            if let Some(text) = fm
                .copyright_text
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 6pt;\">{}</p>",
                    escape_html(text)
                ));
            }
            if !fm.edition.trim().is_empty() {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 6pt;\">{}</p>",
                    escape_html(&fm.edition)
                ));
            }
            if let Some(isbn_p) = fm.isbn_print.as_deref().filter(|s| !s.trim().is_empty()) {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 3pt;\">ISBN (impresso): {}</p>",
                    escape_html(isbn_p)
                ));
            }
            if let Some(isbn_d) = fm.isbn_digital.as_deref().filter(|s| !s.trim().is_empty()) {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 6pt;\">ISBN (digital): {}</p>",
                    escape_html(isbn_d)
                ));
            }
            if let Some(cov) = fm
                .cover_designer
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 2pt;\">Capa: {}</p>",
                    escape_html(cov)
                ));
            }
            if let Some(rev) = fm.proofreader.as_deref().filter(|s| !s.trim().is_empty()) {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 2pt;\">Revisão: {}</p>",
                    escape_html(rev)
                ));
            }
            if let Some(diag) = fm
                .layout_designer
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!(
                    "<p style=\"margin:0 0 6pt;\">Diagramação: {}</p>",
                    escape_html(diag)
                ));
            }
            if let Some(cat) = fm
                .cataloging_data
                .as_deref()
                .filter(|s| !s.trim().is_empty())
            {
                cp_lines.push(format!(
                    "<div style=\"border:1pt solid #D6D9D0;padding:8pt;margin-top:12pt;font-family:monospace;font-size:7pt;\"><pre style=\"margin:0;white-space:pre-wrap;\">{}</pre></div>",
                    escape_html(cat)
                ));
            }
            html.push_str(&format!(
                "<section class=\"front-matter-page copyright-page\"><div>{}</div></section>",
                cp_lines.join("")
            ));
        }
    }

    if fm.include_dedication {
        if let Some(text) = fm
            .dedication_text
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        {
            html.push_str(&format!(
                "<section class=\"front-matter-page dedication-page\"><p style=\"font-size:11pt;line-height:1.6;margin:0;\">{}</p></section><section class=\"front-matter-page blank-page\"></section>",
                escape_html(text)
            ));
        }
    }

    if fm.include_epigraph {
        if let Some(text) = fm.epigraph_text.as_deref().filter(|s| !s.trim().is_empty()) {
            let author_line = fm.epigraph_author.as_deref().filter(|s| !s.trim().is_empty())
                .map(|a| format!("<p style=\"font-size:9.5pt;margin:8pt 0 0;font-style:normal;color:#64695F;\">— {}</p>", escape_html(a)))
                .unwrap_or_default();
            html.push_str(&format!(
                "<section class=\"front-matter-page epigraph-page\"><blockquote style=\"border:none;padding:0;margin:0;font-size:11pt;line-height:1.6;\">{}</blockquote>{}</section><section class=\"front-matter-page blank-page\"></section>",
                escape_html(text), author_line
            ));
        }
    }

    if fm.include_table_of_contents {
        let mut entries = String::new();
        let mut std_idx = 0;
        for (i, chap) in snapshot.chapters.iter().enumerate() {
            let is_std = chap.chapter_type == "standard";
            let label = if is_std {
                std_idx += 1;
                if chap.title.trim().is_empty() {
                    format!("Capítulo {std_idx:02}")
                } else {
                    format!("Capítulo {std_idx:02} · {}", chap.title)
                }
            } else {
                chap.title.clone()
            };
            entries.push_str(&format!(
                "<div class=\"toc-entry\"><a href=\"#chapter-{i}\"><span class=\"toc-title\">{}</span><span class=\"toc-dots\"></span><span class=\"toc-num\" id=\"toc-page-{i}\">—</span></a></div>",
                escape_html(&label)
            ));
        }
        html.push_str(&format!(
            "<section class=\"front-matter-page toc-page\"><h2 class=\"toc-heading\">Sumário</h2><div class=\"toc-list\">{entries}</div></section><section class=\"front-matter-page blank-page\"></section>"
        ));
    }

    html
}

fn css_string(text: &str) -> String {
    let escaped = text
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == ' ' {
                character.to_string()
            } else {
                format!("\\{:x} ", character as u32)
            }
        })
        .collect::<String>();
    format!("\"{escaped}\"")
}
