use super::docx_layout::Typography;
use docx_rs::*;
use scraper::{ElementRef, Html, Node};

#[derive(Clone, Default)]
struct InlineStyle {
    bold: bool,
    italic: bool,
    underline: bool,
    strike: bool,
    color: Option<String>,
    vertical: Option<VertAlignType>,
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

fn runs(
    element: ElementRef<'_>,
    inherited: InlineStyle,
    typography: &Typography<'_>,
) -> Vec<ParagraphChild> {
    let name = element.value().name();
    let mut style = inherited;
    style.bold |= matches!(
        name,
        "b" | "strong" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    );
    style.italic |= matches!(name, "i" | "em" | "blockquote");
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
                    style.color = Some(value[1..].to_string())
                }
                _ => {}
            }
        }
    }
    let mut output = Vec::new();
    for child in element.children() {
        if let Node::Text(text) = child.value() {
            output.push(ParagraphChild::Run(Box::new(styled_run(
                text, &style, typography,
            ))));
        } else if let Some(child) = ElementRef::wrap(child) {
            if child.value().name() == "br" {
                output.push(ParagraphChild::Run(Box::new(
                    typography.run("").add_break(BreakType::TextWrapping),
                )));
            } else {
                output.extend(runs(child, style.clone(), typography));
            }
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
            return vec![ParagraphChild::Hyperlink(link)];
        }
    }
    output
}

pub fn element_paragraph(element: ElementRef<'_>, typography: &Typography<'_>) -> Paragraph {
    let factor = match element.value().name() {
        "h1" => 2.0,
        "h2" => 1.5,
        "h3" => 1.17,
        "h5" => 0.83,
        "h6" => 0.67,
        _ => 1.0,
    };
    let adjusted = Typography {
        family: typography.family,
        size: typography.size * factor,
        line: typography.line,
    };
    let mut paragraph = paragraph_with_italic(element, &adjusted, in_quote(element));
    if in_quote(element) {
        paragraph = paragraph.indent(Some(285), None, Some(0), None);
    }
    if matches!(
        element.value().name(),
        "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    ) {
        paragraph = paragraph.keep_next(true).keep_lines(true);
    }
    let depth = element
        .ancestors()
        .filter_map(ElementRef::wrap)
        .filter(|parent| matches!(parent.value().name(), "ul" | "ol"))
        .count();
    if depth > 0 {
        paragraph = paragraph.indent(
            Some(depth as i32 * 600),
            Some(SpecialIndentType::Hanging(300)),
            Some(0),
            None,
        );
    }
    paragraph
}

fn in_quote(element: ElementRef<'_>) -> bool {
    element
        .ancestors()
        .filter_map(ElementRef::wrap)
        .any(|parent| parent.value().name() == "blockquote")
}

pub fn paragraph_with_italic(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
    italic: bool,
) -> Paragraph {
    let name = element.value().name();
    let mut paragraph = typography.paragraph();
    let style = element.value().attr("style").unwrap_or("");
    for declaration in style.split(';') {
        if let Some(("text-align", value)) = declaration
            .split_once(':')
            .map(|(k, v)| (k.trim(), v.trim()))
        {
            paragraph = paragraph.align(match value {
                "right" => AlignmentType::Right,
                "center" => AlignmentType::Center,
                "justify" => AlignmentType::Both,
                _ => AlignmentType::Left,
            });
        }
    }
    if name == "blockquote" {
        paragraph = paragraph
            .indent(Some(240), None, Some(0), None)
            .line_spacing(
                LineSpacing::new()
                    .before(300)
                    .after(300)
                    .line((typography.size * typography.line * 20.0).round() as i32)
                    .line_rule(LineSpacingType::Exact),
            );
    }
    if name == "hr"
        || element
            .value()
            .classes()
            .any(|class| class == "scene-break")
    {
        return paragraph
            .align(AlignmentType::Center)
            .line_spacing(LineSpacing::new().before(480).after(480))
            .add_run(typography.run("* * *").bold().color("64695F"));
    }
    paragraph.children.extend(runs(
        element,
        InlineStyle {
            italic,
            ..InlineStyle::default()
        },
        typography,
    ));
    paragraph
}

fn append_element(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
    output: &mut Vec<Paragraph>,
) {
    let name = element.value().name();
    let start = output.len();
    let has_blocks = element
        .children()
        .filter_map(ElementRef::wrap)
        .any(|child| {
            matches!(
                child.value().name(),
                "p" | "div" | "ul" | "ol" | "li" | "blockquote"
            )
        });
    if has_blocks && matches!(name, "div" | "ul" | "ol" | "li" | "blockquote") {
        for child in element.children() {
            if let Some(child) = ElementRef::wrap(child) {
                append_element(child, typography, output);
            } else if let Node::Text(text) = child.value() {
                if !text.trim().is_empty() {
                    output.push(
                        typography
                            .paragraph()
                            .add_run(typography.run(text.to_string())),
                    );
                }
            }
        }
    } else {
        output.push(element_paragraph(element, typography));
    }
    if name == "li" {
        let ordered = element
            .parent()
            .and_then(ElementRef::wrap)
            .is_some_and(|parent| parent.value().name() == "ol");
        let index = element
            .prev_siblings()
            .filter_map(ElementRef::wrap)
            .filter(|sibling| sibling.value().name() == "li")
            .count()
            + 1;
        let marker = if ordered {
            format!("{index}. ")
        } else {
            "• ".to_string()
        };
        if let Some(first) = output.get_mut(start) {
            first
                .children
                .insert(0, ParagraphChild::Run(Box::new(typography.run(marker))));
        }
    }
}

pub fn paragraphs(html: &str, typography: &Typography<'_>) -> Vec<Paragraph> {
    let fragment = Html::parse_fragment(html);
    let mut output = Vec::new();
    for child in fragment.root_element().children() {
        if let Some(element) = ElementRef::wrap(child) {
            append_element(element, typography, &mut output);
        } else if let Node::Text(text) = child.value() {
            if !text.trim().is_empty() {
                output.push(
                    typography
                        .paragraph()
                        .add_run(typography.run(text.to_string())),
                );
            }
        }
    }
    output
}
