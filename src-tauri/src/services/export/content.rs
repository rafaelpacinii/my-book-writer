use crate::error::AppError;
use scraper::{ElementRef, Html, Node, Selector};
use serde_json::Value;

pub fn escape_html(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

pub fn chapter_html(json: &str) -> Result<String, AppError> {
    let doc: Value = serde_json::from_str(json).map_err(|e| {
        super::export_error(
            "Um capítulo contém dados inválidos. Abra e salve o capítulo novamente.",
            e,
        )
    })?;
    let source = if let Some(html) = doc.get("html").and_then(Value::as_str) {
        html.to_string()
    } else if let Some(text) = doc.get("text").and_then(Value::as_str) {
        plain_html(text)
    } else if let Some(nodes) = doc.get("content").and_then(Value::as_array) {
        nodes
            .iter()
            .map(|node| {
                let mut text = String::new();
                collect_text(node, &mut text);
                plain_html(&text)
            })
            .collect()
    } else {
        return Err(AppError::Export(
            "Formato de capítulo não reconhecido para exportação.".into(),
        ));
    };
    let fragment = Html::parse_fragment(&source);
    let mut blocks = Vec::new();
    for child in fragment.root_element().children() {
        blocks.push(render_node(child.value(), ElementRef::wrap(child))?);
    }
    Ok(normalize_blocks(blocks))
}

fn is_blank(html: &str) -> bool {
    let fragment = Html::parse_fragment(html);
    let scene = Selector::parse("hr, .scene-break").expect("static selector");
    fragment.select(&scene).next().is_none()
        && fragment
            .root_element()
            .text()
            .all(|text| text.trim().is_empty())
}

fn normalize_blocks(blocks: Vec<String>) -> String {
    let mut normalized = Vec::new();
    let mut previous_blank = false;
    for block in blocks {
        if block.is_empty() || block.trim().is_empty() {
            continue;
        }
        let blank = is_blank(&block);
        if blank && previous_blank {
            continue;
        }
        normalized.push(block);
        previous_blank = blank;
    }
    while normalized.last().is_some_and(|block| is_blank(block)) {
        normalized.pop();
    }
    normalized.concat()
}

fn collect_text(value: &Value, output: &mut String) {
    if let Some(text) = value.get("text").and_then(Value::as_str) {
        output.push_str(text);
    }
    if let Some(children) = value.get("content").and_then(Value::as_array) {
        for child in children {
            collect_text(child, output);
        }
    }
}

fn plain_html(text: &str) -> String {
    text.split("\n\n")
        .map(|paragraph| format!("<p>{}</p>", escape_html(paragraph).replace('\n', "<br>")))
        .collect()
}

fn render_node(node: &Node, element: Option<ElementRef<'_>>) -> Result<String, AppError> {
    if let Node::Text(text) = node {
        return Ok(escape_html(text));
    }
    let Some(element) = element else {
        return Ok(String::new());
    };
    let name = element.value().name();
    if matches!(
        name,
        "script"
            | "style"
            | "iframe"
            | "object"
            | "embed"
            | "svg"
            | "video"
            | "audio"
            | "link"
            | "meta"
    ) {
        return Ok(String::new());
    }
    if name == "img" {
        return Err(AppError::Export(
            "A exportação de imagens dentro dos capítulos ainda não está disponível.".into(),
        ));
    }
    if element.value().attr("data-page-break") == Some("true") {
        return Ok(String::new());
    }
    let mut child_html = Vec::new();
    let mut consecutive_breaks = 0;
    for child in element.children() {
        let rendered = render_node(child.value(), ElementRef::wrap(child))?;
        if rendered.starts_with("<br") {
            consecutive_breaks += 1;
            if consecutive_breaks > 2 {
                continue;
            }
        } else if !rendered.trim().is_empty() {
            consecutive_breaks = 0;
        }
        child_html.push(rendered);
    }
    let children = if matches!(name, "div" | "blockquote" | "ul" | "ol") {
        normalize_blocks(child_html)
    } else {
        child_html.concat()
    };
    if !matches!(
        name,
        "p" | "div"
            | "br"
            | "hr"
            | "b"
            | "strong"
            | "i"
            | "em"
            | "u"
            | "s"
            | "span"
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
            | "sup"
            | "sub"
            | "pre"
            | "code"
            | "a"
    ) {
        return Ok(children);
    }
    let mut attrs = String::new();
    if element
        .value()
        .classes()
        .any(|class| class == "scene-break")
    {
        attrs.push_str(" class=\"scene-break\"");
    }
    let mut style = safe_style(element.value().attr("style").unwrap_or(""));
    if let Some(align) = element.value().attr("align") {
        let alignment = safe_style(&format!("text-align:{align}"));
        if !alignment.is_empty() {
            if !style.is_empty() {
                style.push(';');
            }
            style.push_str(&alignment);
        }
    }
    if !style.is_empty() {
        attrs.push_str(&format!(" style=\"{}\"", escape_html(&style)));
    }
    if name == "a" {
        if let Some(href) = element.value().attr("href").filter(|href| {
            href.starts_with("https://") || href.starts_with("http://") || href.starts_with('#')
        }) {
            attrs.push_str(&format!(" href=\"{}\"", escape_html(href)));
        }
    }
    if matches!(name, "br" | "hr") {
        return Ok(format!("<{name}{attrs}>"));
    }
    Ok(format!("<{name}{attrs}>{children}</{name}>"))
}

fn safe_style(style: &str) -> String {
    style
        .split(';')
        .filter_map(|declaration| {
            let (key, value) = declaration.split_once(':')?;
            let key = key.trim().to_ascii_lowercase();
            let value = value.trim().to_ascii_lowercase();
            let valid = match key.as_str() {
                "text-align" => matches!(value.as_str(), "left" | "right" | "center" | "justify"),
                "font-weight" => matches!(value.as_str(), "normal" | "bold" | "400" | "700"),
                "font-style" => matches!(value.as_str(), "normal" | "italic"),
                "text-decoration" | "text-decoration-line" => {
                    matches!(value.as_str(), "underline" | "line-through" | "none")
                }
                "white-space" => matches!(value.as_str(), "normal" | "pre-wrap"),
                _ => false,
            };
            valid.then(|| format!("{key}:{value}"))
        })
        .collect::<Vec<_>>()
        .join(";")
}
