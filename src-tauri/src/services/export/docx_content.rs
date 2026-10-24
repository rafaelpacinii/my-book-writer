use super::{docx_image, docx_layout::Typography};
use crate::error::AppError;
use docx_rs::*;
use scraper::{ElementRef, Node, Selector};

#[derive(Clone, Default)]
struct InlineStyle {
    bold: bool,
    italic: bool,
    underline: bool,
    strike: bool,
    color: Option<String>,
    vertical: Option<VertAlignType>,
}

fn apply_style(element: ElementRef<'_>, mut style: InlineStyle) -> InlineStyle {
    let name = element.value().name();
    style.bold |= matches!(
        name,
        "b" | "strong" | "th" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    );
    style.italic |= matches!(name, "i" | "em" | "blockquote");
    if name == "blockquote" {
        style.color = Some("64695F".into());
    }
    style.underline |= name == "u";
    style.strike |= name == "s";
    if name == "sup" {
        style.vertical = Some(VertAlignType::SuperScript);
    }
    if name == "sub" {
        style.vertical = Some(VertAlignType::SubScript);
    }
    for declaration in element.value().attr("style").unwrap_or("").split(';') {
        if let Some((key, value)) = declaration.split_once(':') {
            match (key.trim(), value.trim()) {
                ("font-weight", "bold" | "700") => style.bold = true,
                ("font-weight", "normal" | "400") => style.bold = false,
                ("font-style", "italic") => style.italic = true,
                ("font-style", "normal") => style.italic = false,
                ("text-decoration" | "text-decoration-line", "underline") => style.underline = true,
                ("text-decoration" | "text-decoration-line", "line-through") => style.strike = true,
                ("color", value) if value.starts_with('#') && value.len() == 7 => {
                    style.color = Some(value[1..].into())
                }
                _ => {}
            }
        }
    }
    style
}

fn ancestors_style(element: ElementRef<'_>) -> InlineStyle {
    let parents: Vec<_> = element.ancestors().filter_map(ElementRef::wrap).collect();
    parents
        .into_iter()
        .rev()
        .fold(InlineStyle::default(), |style, parent| {
            apply_style(parent, style)
        })
}

fn styled_run(text: &str, style: &InlineStyle, typography: &Typography<'_>) -> Run {
    let mut run = typography.run(text);
    if style.bold {
        run = run.bold();
    }
    if style.italic {
        run = run.italic();
    }
    if style.underline {
        run = run.underline("single");
    }
    if style.strike {
        run = run.strike();
    }
    if let Some(color) = &style.color {
        run = run.color(color);
    }
    if let Some(vertical) = style.vertical {
        run.run_property = run.run_property.vert_align(vertical);
    }
    run
}

pub fn text(text: &str, parent: ElementRef<'_>, typography: &Typography<'_>) -> ParagraphChild {
    let style = apply_style(parent, ancestors_style(parent));
    ParagraphChild::Run(Box::new(styled_run(text, &style, typography)))
}

pub fn inline(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
) -> Result<Vec<ParagraphChild>, AppError> {
    runs(element, ancestors_style(element), typography)
}

fn runs(
    element: ElementRef<'_>,
    inherited: InlineStyle,
    typography: &Typography<'_>,
) -> Result<Vec<ParagraphChild>, AppError> {
    let name = element.value().name();
    let style = apply_style(element, inherited);
    if name == "img" {
        return Ok(vec![ParagraphChild::Run(Box::new(
            typography
                .run("")
                .add_image(docx_image::picture(element, typography)?),
        ))]);
    }
    if name == "br" {
        return Ok(vec![ParagraphChild::Run(Box::new(
            typography.run("").add_break(BreakType::TextWrapping),
        ))]);
    }
    let mut output = Vec::new();
    for child in element.children() {
        if let Node::Text(text) = child.value() {
            output.push(ParagraphChild::Run(Box::new(styled_run(
                text, &style, typography,
            ))));
        } else if let Some(child) = ElementRef::wrap(child) {
            output.extend(runs(child, style.clone(), typography)?);
        }
    }
    if name == "a" {
        if let Some(href) = element.value().attr("href") {
            let mut link = Hyperlink::new(
                href.trim_start_matches('#'),
                if href.starts_with('#') {
                    HyperlinkType::Anchor
                } else {
                    HyperlinkType::External
                },
            );
            for child in output {
                if let ParagraphChild::Run(run) = child {
                    link = link.add_run(*run);
                }
            }
            return Ok(vec![ParagraphChild::Hyperlink(link)]);
        }
    }
    Ok(output)
}

pub fn empty_paragraph(element: ElementRef<'_>, typography: &Typography<'_>) -> Paragraph {
    let mut paragraph = typography.paragraph();
    let compact = matches!(element.value().name(), "th" | "td" | "caption" | "li");
    if compact {
        paragraph = paragraph.line_spacing(
            LineSpacing::new()
                .before(0)
                .after(0)
                .line((typography.size * typography.line * 20.0).round() as i32)
                .line_rule(LineSpacingType::Exact),
        );
    }
    if element.value().name() == "img"
        || element
            .select(&Selector::parse("img").expect("static selector"))
            .next()
            .is_some()
    {
        paragraph = paragraph.line_spacing(
            LineSpacing::new()
                .before(0)
                .after(if compact {
                    0
                } else {
                    (typography.size * 25.0).round() as u32
                })
                .line((typography.size * typography.line * 20.0).round() as i32)
                .line_rule(LineSpacingType::AtLeast),
        );
    }
    let parents = std::iter::once(element).chain(element.ancestors().filter_map(ElementRef::wrap));
    let alignment = parents
        .flat_map(|parent| parent.value().attr("style").unwrap_or("").split(';'))
        .filter_map(|declaration| declaration.split_once(':'))
        .find_map(|(key, value)| (key.trim() == "text-align").then_some(value.trim()));
    if let Some(alignment) = alignment {
        paragraph = paragraph.align(match alignment {
            "right" => AlignmentType::Right,
            "center" => AlignmentType::Center,
            "justify" => AlignmentType::Both,
            _ => AlignmentType::Left,
        });
    } else if matches!(element.value().name(), "th" | "caption") {
        paragraph = paragraph.align(AlignmentType::Center);
    }
    if element.value().name() == "blockquote"
        || element
            .ancestors()
            .filter_map(ElementRef::wrap)
            .any(|parent| parent.value().name() == "blockquote")
    {
        paragraph = paragraph.indent(Some(285), None, Some(0), None);
    }
    let depth = element
        .ancestors()
        .filter_map(ElementRef::wrap)
        .filter(|parent| matches!(parent.value().name(), "ul" | "ol"))
        .count();
    if depth > 0 {
        paragraph = paragraph.indent(
            Some(depth as i32 * 600),
            Some(SpecialIndentType::FirstLine(0)),
            Some(0),
            None,
        );
    }
    paragraph
}

pub fn element_paragraph(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
) -> Result<Paragraph, AppError> {
    let factor = match element.value().name() {
        "h1" => 2.0,
        "h2" => 1.5,
        "h3" => 1.17,
        "h5" => 0.83,
        "h6" => 0.67,
        _ => 1.0,
    };
    let adjusted = Typography {
        size: typography.size * factor,
        ..*typography
    };
    let mut paragraph = paragraph_with_italic(element, &adjusted, false)?;
    if matches!(
        element.value().name(),
        "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    ) {
        paragraph = paragraph.keep_next(true).keep_lines(true);
    }
    Ok(paragraph)
}

pub fn paragraph_with_italic(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
    italic: bool,
) -> Result<Paragraph, AppError> {
    let mut paragraph = empty_paragraph(element, typography);
    if element.value().name() == "blockquote" {
        paragraph = paragraph.line_spacing(
            LineSpacing::new()
                .before(300)
                .after(300)
                .line((typography.size * typography.line * 20.0).round() as i32)
                .line_rule(LineSpacingType::Exact),
        );
    }
    if element.value().name() == "hr"
        || element
            .value()
            .classes()
            .any(|class| class == "scene-break")
    {
        return Ok(paragraph
            .align(AlignmentType::Center)
            .line_spacing(LineSpacing::new().before(480).after(480))
            .add_run(typography.run("* * *").bold().color("64695F")));
    }
    let mut inherited = ancestors_style(element);
    inherited.italic |= italic;
    paragraph
        .children
        .extend(runs(element, inherited, typography)?);
    Ok(paragraph)
}
