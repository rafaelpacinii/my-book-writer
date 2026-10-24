use super::{docx_content, docx_layout::Typography, docx_lists::Lists, docx_table};
use crate::error::AppError;
use docx_rs::*;
use scraper::{ElementRef, Html, Node};

pub enum Block {
    Paragraph(Box<Paragraph>),
    Table(Box<Table>),
}

pub fn render(
    html: &str,
    typography: &Typography<'_>,
    lists: &mut Lists,
) -> Result<Vec<Block>, AppError> {
    children(
        Html::parse_fragment(html).root_element(),
        typography,
        lists,
        0,
    )
}

fn is_block(element: ElementRef<'_>) -> bool {
    matches!(
        element.value().name(),
        "p" | "div"
            | "blockquote"
            | "ul"
            | "ol"
            | "li"
            | "h1"
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6"
            | "pre"
            | "table"
            | "hr"
    )
}

pub fn children(
    parent: ElementRef<'_>,
    typography: &Typography<'_>,
    lists: &mut Lists,
    depth: usize,
) -> Result<Vec<Block>, AppError> {
    let mut output = Vec::new();
    let mut inline = Vec::new();
    for child in parent.children() {
        if let Some(element) = ElementRef::wrap(child) {
            if is_block(element) {
                flush(parent, typography, &mut inline, &mut output);
                append(element, typography, lists, depth, &mut output)?;
            } else {
                inline.extend(docx_content::inline(element, typography)?);
            }
        } else if let Node::Text(text) = child.value() {
            if !text.trim().is_empty() || !inline.is_empty() {
                inline.push(docx_content::text(text, parent, typography));
            }
        }
    }
    flush(parent, typography, &mut inline, &mut output);
    Ok(output)
}

fn flush(
    parent: ElementRef<'_>,
    typography: &Typography<'_>,
    inline: &mut Vec<ParagraphChild>,
    output: &mut Vec<Block>,
) {
    if inline.is_empty() {
        return;
    }
    let mut paragraph = docx_content::empty_paragraph(parent, typography);
    paragraph.children = std::mem::take(inline);
    output.push(Block::Paragraph(Box::new(paragraph)));
}

fn append(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
    lists: &mut Lists,
    depth: usize,
    output: &mut Vec<Block>,
) -> Result<(), AppError> {
    match element.value().name() {
        "table" => {
            if let Some(caption) = element
                .children()
                .filter_map(ElementRef::wrap)
                .find(|child| child.value().name() == "caption")
            {
                output.push(Block::Paragraph(Box::new(docx_content::element_paragraph(
                    caption, typography,
                )?)));
            }
            output.push(Block::Table(Box::new(docx_table::render(
                element, typography, lists, depth,
            )?)));
        }
        "ul" | "ol" => list(element, typography, lists, depth, output)?,
        "div" | "blockquote" | "li"
            if !element
                .value()
                .classes()
                .any(|class| class == "scene-break") =>
        {
            let blocks = children(element, typography, lists, depth)?;
            if blocks.is_empty() {
                output.push(Block::Paragraph(Box::new(docx_content::element_paragraph(
                    element, typography,
                )?)));
            } else {
                output.extend(blocks);
            }
        }
        _ => output.push(Block::Paragraph(Box::new(docx_content::element_paragraph(
            element, typography,
        )?))),
    }
    Ok(())
}

fn list(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
    lists: &mut Lists,
    depth: usize,
    output: &mut Vec<Block>,
) -> Result<(), AppError> {
    if depth >= 9 {
        return Err(AppError::Export("Uma lista excede os nove níveis suportados pelo Word. Reduza o aninhamento antes de exportar.".into()));
    }
    let ordered = element.value().name() == "ol";
    let mut id = lists.create(ordered, number(element, "start").unwrap_or(1));
    for item in element
        .children()
        .filter_map(ElementRef::wrap)
        .filter(|child| child.value().name() == "li")
    {
        if ordered {
            if let Some(start) = number(item, "value") {
                id = lists.create(true, start);
            }
        }
        let mut blocks = children(item, typography, lists, depth + 1)?;
        if !matches!(blocks.first(), Some(Block::Paragraph(_))) {
            blocks.insert(
                0,
                Block::Paragraph(Box::new(docx_content::empty_paragraph(item, typography))),
            );
        }
        if let Some(Block::Paragraph(first)) = blocks.first_mut() {
            **first = first
                .as_ref()
                .clone()
                .numbering(NumberingId::new(id), IndentLevel::new(depth))
                .indent(
                    Some((depth as i32 + 1) * 600),
                    Some(SpecialIndentType::Hanging(300)),
                    Some(0),
                    None,
                );
        }
        output.extend(blocks);
    }
    Ok(())
}

fn number(element: ElementRef<'_>, name: &str) -> Option<usize> {
    element
        .value()
        .attr(name)
        .and_then(|value| value.parse().ok())
}
