use crate::repositories::export_repository::BookExportSnapshot;
use docx_rs::*;

pub struct Typography<'a> {
    pub family: &'a str,
    pub size: f64,
    pub line: f64,
}

impl Typography<'_> {
    pub fn run(&self, text: impl Into<String>) -> Run {
        Run::new()
            .add_text(text)
            .size((self.size * 2.0).round() as usize)
            .fonts(
                RunFonts::new()
                    .ascii(self.family)
                    .hi_ansi(self.family)
                    .cs(self.family)
                    .east_asia(self.family),
            )
            .color("292D28")
    }

    pub fn paragraph(&self) -> Paragraph {
        Paragraph::new()
            .align(AlignmentType::Left)
            .indent(
                Some(0),
                Some(SpecialIndentType::FirstLine(0)),
                Some(0),
                None,
            )
            .widow_control(false)
            .line_spacing(
                LineSpacing::new()
                    .before(0)
                    .after((self.size * 25.0).round() as u32)
                    .line((self.size * self.line * 20.0).round() as i32)
                    .line_rule(LineSpacingType::Exact),
            )
    }
}

pub fn twips(um: f64) -> u32 {
    (um * 1440.0 / 25400.0).round() as u32
}

pub fn page_margin(snapshot: &BookExportSnapshot) -> PageMargin {
    let book = &snapshot.book;
    let extra = super::layout::running_space_um(snapshot);
    PageMargin::new()
        .top(twips(book.margin_top_um as f64 + extra) as i32)
        .bottom(twips(book.margin_bottom_um as f64 + extra) as i32)
        .left(twips(book.margin_left_um as f64) as i32)
        .right(twips(book.margin_right_um as f64) as i32)
        .header(twips(book.margin_top_um as f64 + extra / 2.0) as i32)
        .footer(twips(book.margin_bottom_um as f64 + extra / 2.0) as i32)
}

pub fn section(snapshot: &BookExportSnapshot, running: bool) -> Section {
    let book = &snapshot.book;
    let mut section = Section::new()
        .page_size(PageSize::new().size(
            twips(snapshot.format.width_um as f64),
            twips(snapshot.format.height_um as f64),
        ))
        .page_margin(page_margin(snapshot));
    if running {
        let small = Typography {
            family: &snapshot.font.family_name,
            size: 7.0,
            line: 1.0,
        };
        let header = small
            .paragraph()
            .align(AlignmentType::Center)
            .add_run(small.run(book.title.to_uppercase()).character_spacing(14));
        let footer = small
            .paragraph()
            .align(AlignmentType::Center)
            .size(15)
            .add_page_num(PageNum::new());
        section = section
            .header(Header::new().add_paragraph(header))
            .footer(Footer::new().add_paragraph(footer));
    } else {
        section = section
            .header(Header::new().add_paragraph(Paragraph::new()))
            .footer(Footer::new().add_paragraph(Paragraph::new()));
    }
    section
}
