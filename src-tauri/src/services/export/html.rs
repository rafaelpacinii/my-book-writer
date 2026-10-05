use super::{
    content::{chapter_html, escape_html},
    fonts::font_css,
};
use crate::error::AppError;
use crate::repositories::export_repository::BookExportSnapshot;

pub fn render_book(snapshot: &BookExportSnapshot) -> Result<String, AppError> {
    validate_layout(snapshot)?;
    let book = &snapshot.book;
    let font = font_css(&snapshot.font.family_name)?;
    let title = escape_html(&book.title);
    let author = escape_html(&book.author_name);
    let mut chapters = String::new();
    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        let html = chapter_html(&chapter.content_json)?;
        chapters.push_str(&format!(
            "<section class=\"chapter\"><div class=\"paged-chapter-heading\"><span>Capítulo {:02}</span><h2>{}</h2></div><div class=\"editor-content editor-content-paged\">{html}</div></section>",
            index + 1, escape_html(&chapter.title),
        ));
    }
    let mm = |value: i64| value as f64 / 1000.0;
    // The editor reserves 2 em for each running header/footer inside the margins.
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
        html, body {{ margin: 0; padding: 0; }}
        body {{ font-family: '{family}'; font-size: {size}pt; line-height: {line_height}; color: #292D28; }}
        .chapter + .chapter {{ break-before: page; }}
        .paged-chapter-heading span {{ display: block; font-size: 7.5pt; font-weight: 700;
            text-transform: uppercase; letter-spacing: .025em; margin-bottom: 3pt; }}
        .paged-chapter-heading h2 {{ font-size: 15pt; font-weight: 400; margin: 0 0 9pt; line-height: 1.4; }}
        .editor-content blockquote {{ border-left: 2.25pt solid #52664E; padding-left: 12pt;
            margin: 15pt 0; font-style: italic; color: #64695F; }}
        .editor-content .scene-break {{ text-align: center; margin: 24pt 0; letter-spacing: .35em;
            color: #64695F; font-weight: 700; }}
        a {{ color: inherit; }}
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
    );
    Ok(format!(
        "<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; font-src data:;\"><meta name=\"author\" content=\"{author}\"><title>{title}</title><style>{css}</style></head><body>{chapters}</body></html>"
    ))
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

fn validate_layout(snapshot: &BookExportSnapshot) -> Result<(), AppError> {
    let book = &snapshot.book;
    let size = book.font_size_pt;
    let line_height = book.line_height_ratio;
    let margins = [
        book.margin_top_um,
        book.margin_bottom_um,
        book.margin_left_um,
        book.margin_right_um,
    ];
    let usable_width = snapshot.format.width_um - book.margin_left_um - book.margin_right_um;
    let usable_height = (snapshot.format.height_um - book.margin_top_um - book.margin_bottom_um)
        as f64
        - size * 4.0 * 25400.0 / 72.0;
    if !size.is_finite()
        || !(6.0..=72.0).contains(&size)
        || !line_height.is_finite()
        || !(1.0..=3.0).contains(&line_height)
        || margins.iter().any(|margin| *margin < 0)
        || usable_width < 10000
        || usable_height < size * line_height * 25400.0 / 72.0
    {
        return Err(AppError::Export(
            "As configurações de página não deixam espaço suficiente para o texto.".into(),
        ));
    }
    if snapshot.chapters.is_empty() {
        return Err(AppError::Export(
            "Adicione pelo menos um capítulo antes de exportar.".into(),
        ));
    }
    Ok(())
}
