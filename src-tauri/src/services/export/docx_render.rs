use super::{
    docx_content, docx_front_matter,
    docx_layout::{self, Typography},
    docx_package,
    validation::{self, ExportFormat},
};
use crate::{error::AppError, repositories::export_repository::BookExportSnapshot};
use docx_rs::*;

pub fn render(snapshot: &BookExportSnapshot) -> Result<Vec<u8>, AppError> {
    validation::validate(snapshot, ExportFormat::Docx)?;
    let typography = Typography {
        family: super::fonts::docx_family(&snapshot.font.family_name),
        size: snapshot.book.font_size_pt,
        line: snapshot.book.line_height_ratio,
    };
    let running = Typography {
        family: typography.family,
        size: 7.0,
        line: 1.0,
    };
    let doc = Docx::new()
        .page_size(
            docx_layout::twips(snapshot.format.width_um as f64),
            docx_layout::twips(snapshot.format.height_um as f64),
        )
        .page_margin(docx_layout::page_margin(snapshot))
        .default_size((typography.size * 2.0).round() as usize)
        .default_fonts(
            RunFonts::new()
                .ascii(typography.family)
                .hi_ansi(typography.family)
                .cs(typography.family)
                .east_asia(typography.family),
        )
        .default_line_spacing(
            LineSpacing::new()
                .before(0)
                .after((typography.size * 25.0).round() as u32)
                .line((typography.size * typography.line * 20.0).round() as i32)
                .line_rule(LineSpacingType::Exact),
        )
        .add_style(Style::new("MBWChapterTitle", StyleType::Paragraph).name("MBWChapterTitle"))
        .header(
            Header::new().add_paragraph(
                running.paragraph().align(AlignmentType::Center).add_run(
                    running
                        .run(snapshot.book.title.to_uppercase())
                        .character_spacing(14),
                ),
            ),
        )
        .footer(
            Footer::new().add_paragraph(
                running.paragraph().align(AlignmentType::Center).add_run(
                    running
                        .run("")
                        .size(15)
                        .add_field_char(FieldCharType::Begin, false)
                        .add_instr_text(InstrText::PAGE(InstrPAGE {}))
                        .add_field_char(FieldCharType::Separate, false)
                        .add_text("1")
                        .add_field_char(FieldCharType::End, false),
                ),
            ),
        );
    let (mut doc, alignments) = docx_front_matter::add(doc, snapshot);
    let mut number = 0;
    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        let standard = chapter.chapter_type == "standard";
        if standard {
            number += 1;
            let label = Typography {
                family: typography.family,
                size: 7.5,
                line: 1.4,
            };
            doc = doc.add_paragraph(
                label
                    .paragraph()
                    .page_break_before(index > 0)
                    .keep_next(true)
                    .keep_lines(true)
                    .line_spacing(
                        LineSpacing::new()
                            .before(0)
                            .after(60)
                            .line(210)
                            .line_rule(LineSpacingType::Exact),
                    )
                    .add_run(label.run(format!("CAPÍTULO {number:02}")).bold()),
            );
        }
        let title = Typography {
            family: typography.family,
            size: 15.0,
            line: 1.4,
        };
        let heading = title
            .paragraph()
            .style("MBWChapterTitle")
            .page_break_before(!standard && index > 0)
            .keep_next(true)
            .keep_lines(true)
            .line_spacing(
                LineSpacing::new()
                    .before(0)
                    .after(180)
                    .line(420)
                    .line_rule(LineSpacingType::Exact),
            )
            .add_bookmark_start(index, format!("MBWChapter{index}"))
            .add_run(title.run(&chapter.title))
            .add_bookmark_end(index);
        doc = doc.add_paragraph(heading);
        let content = validation::chapter_content(chapter, index)?;
        for paragraph in docx_content::paragraphs(&content, &typography) {
            doc = doc.add_paragraph(paragraph);
        }
    }
    let mut buffer = std::io::Cursor::new(Vec::new());
    doc.build()
        .pack(&mut buffer)
        .map_err(|error| super::export_error("Falha ao gerar o arquivo DOCX.", error))?;
    docx_package::finish(
        &buffer.into_inner(),
        &snapshot.font.family_name,
        &alignments,
    )
}
