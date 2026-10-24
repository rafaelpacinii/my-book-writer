use super::{
    docx_content,
    docx_layout::{self, Typography},
    html,
};
use crate::error::AppError;
use crate::repositories::export_repository::BookExportSnapshot;
use docx_rs::*;
use scraper::{Html, Selector};

pub fn add(
    mut doc: Docx,
    snapshot: &BookExportSnapshot,
) -> Result<(Docx, Vec<&'static str>), AppError> {
    let source = html::render_front_matter(snapshot);
    let fragment = Html::parse_fragment(&source);
    let pages = Selector::parse(".front-matter-page").expect("static selector");
    let paragraphs = Selector::parse("h1, h2, p, blockquote").expect("static selector");
    let mut alignments = Vec::new();
    for page in fragment.select(&pages) {
        let classes: Vec<_> = page.value().classes().collect();
        let centered = classes
            .iter()
            .any(|class| matches!(*class, "half-title-page" | "title-page"));
        let right = classes
            .iter()
            .any(|class| matches!(*class, "dedication-page" | "epigraph-page"));
        let vertical = if classes.contains(&"copyright-page") {
            "bottom"
        } else if right || classes.contains(&"half-title-page") {
            "center"
        } else {
            "top"
        };
        alignments.push(vertical);
        let mut section = docx_layout::section(snapshot, false);
        let elements: Vec<_> = page.select(&paragraphs).collect();
        let title_page = classes.contains(&"title-page");
        let usable_height = snapshot.format.height_um as f64 * 72.0 / 25400.0
            - (snapshot.book.margin_top_um as f64 + snapshot.book.margin_bottom_um as f64) * 72.0
                / 25400.0
            - snapshot.book.font_size_pt * 4.0;
        let total_height: f64 = elements
            .iter()
            .map(|element| {
                let style = element.value().attr("style").unwrap_or("");
                css_number(style, "font-size").unwrap_or(snapshot.book.font_size_pt) * 1.4
                    + margin(style, false)
                    + margin(style, true)
            })
            .sum();
        let title_gap = ((usable_height * 0.85 - snapshot.book.font_size_pt * 4.0 - total_height)
            / 2.0)
            .max(0.0);
        let mut previous_group = None;
        for (index, element) in elements.into_iter().enumerate() {
            let style = element.value().attr("style").unwrap_or("");
            let size = style
                .split(';')
                .filter_map(|item| item.split_once(':'))
                .find_map(|(key, value)| {
                    (key.trim() == "font-size")
                        .then(|| value.trim().trim_end_matches("pt").parse::<f64>().ok())
                        .flatten()
                })
                .unwrap_or(if element.value().name() == "h2" {
                    14.0
                } else {
                    snapshot.book.font_size_pt
                });
            let typography = Typography {
                size,
                line: css_number(style, "line-height").unwrap_or(1.4),
                ..Typography::book(snapshot)
            };
            let mut paragraph = docx_content::paragraph_with_italic(element, &typography, right)?;
            let group = element.parent().map(|parent| parent.id());
            let mut before = margin(style, false);
            if title_page {
                if index == 0 {
                    before += snapshot.book.font_size_pt * 2.0;
                } else if group != previous_group {
                    before += title_gap;
                }
            }
            previous_group = group;
            paragraph = paragraph.line_spacing(
                LineSpacing::new()
                    .before((before * 20.0).round() as u32)
                    .after((margin(style, true) * 20.0).round() as u32)
                    .line((size * typography.line * 20.0).round() as i32)
                    .line_rule(LineSpacingType::Exact),
            );
            if centered || element.value().name() == "h2" {
                paragraph = paragraph.align(AlignmentType::Center);
            }
            if right {
                let width = snapshot.format.width_um as f64
                    - snapshot.book.margin_left_um as f64
                    - snapshot.book.margin_right_um as f64;
                paragraph = paragraph.align(AlignmentType::Right).indent(
                    Some(0),
                    None,
                    Some(docx_layout::twips(width * 0.12) as i32),
                    None,
                );
            }
            section = section.add_paragraph(paragraph);
        }
        if classes.contains(&"toc-page") {
            section = add_toc(section, snapshot);
        }
        if classes.contains(&"blank-page") {
            section = section.add_paragraph(
                Paragraph::new().line_spacing(
                    LineSpacing::new()
                        .before(0)
                        .after(0)
                        .line(20)
                        .line_rule(LineSpacingType::Exact),
                ),
            );
        }
        doc = doc.add_section(section);
    }
    Ok((doc, alignments))
}

fn add_toc(mut section: Section, snapshot: &BookExportSnapshot) -> Section {
    let typography = Typography {
        size: 10.0,
        line: 1.4,
        ..Typography::book(snapshot)
    };
    let instruction = InstrToC::new()
        .add_style_with_level(StyleWithLevel::new("MBWChapterTitle", 1))
        .hyperlink();
    section = section.add_paragraph(
        typography.paragraph().add_run(
            Run::new()
                .add_field_char(FieldCharType::Begin, true)
                .add_instr_text(InstrText::TOC(instruction))
                .add_field_char(FieldCharType::Separate, false),
        ),
    );
    let width = docx_layout::twips(
        snapshot.format.width_um as f64
            - snapshot.book.margin_left_um as f64
            - snapshot.book.margin_right_um as f64,
    );
    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        let bookmark = format!("MBWChapter{index}");
        let title = if chapter.title.trim().is_empty() {
            format!("Capítulo {}", index + 1)
        } else {
            chapter.title.clone()
        };
        let reference = typography
            .run("")
            .add_field_char(FieldCharType::Begin, true)
            .add_instr_text(InstrText::PAGEREF(InstrPAGEREF::new(&bookmark).hyperlink()))
            .add_field_char(FieldCharType::Separate, false)
            .add_text("—")
            .add_field_char(FieldCharType::End, false);
        section = section.add_paragraph(
            typography
                .paragraph()
                .add_tab(
                    Tab::new()
                        .val(TabValueType::Right)
                        .leader(TabLeaderType::Dot)
                        .pos(width as usize),
                )
                .add_hyperlink(
                    Hyperlink::new(bookmark, HyperlinkType::Anchor)
                        .add_run(typography.run(title))
                        .add_run(Run::new().add_tab())
                        .add_run(reference),
                ),
        );
    }
    section.add_paragraph(
        typography
            .paragraph()
            .add_run(Run::new().add_field_char(FieldCharType::End, false)),
    )
}

fn css_number(style: &str, property: &str) -> Option<f64> {
    style
        .split(';')
        .filter_map(|item| item.split_once(':'))
        .find_map(|(key, value)| {
            (key.trim() == property)
                .then(|| value.trim().trim_end_matches("pt").parse().ok())
                .flatten()
        })
}

fn margin(style: &str, after: bool) -> f64 {
    let Some(value) = style
        .split(';')
        .filter_map(|item| item.split_once(':'))
        .find_map(|(key, value)| (key.trim() == "margin").then_some(value))
    else {
        return 0.0;
    };
    let values: Vec<_> = value.split_whitespace().collect();
    let index = if after && values.len() >= 3 { 2 } else { 0 };
    values
        .get(index)
        .and_then(|value| value.trim_end_matches("pt").parse().ok())
        .unwrap_or(0.0)
}
