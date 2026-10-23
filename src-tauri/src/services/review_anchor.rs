use scraper::Html;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewAnchor {
    version: u8,
    start: usize,
    end: usize,
    quote: String,
    prefix: String,
    suffix: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    document_hash: Option<String>,
}

/// Offsets use UTF-16 code units, matching DOM Range/string offsets in the UI.
pub fn chapter_text(json: &str) -> String {
    fn extract(value: &Value) -> String {
        if let Some(html) = value.get("html").and_then(Value::as_str) {
            return Html::parse_fragment(html).root_element().text().collect();
        }
        if let Some(text) = value.get("text").and_then(Value::as_str) {
            // The legacy editor renders paragraph/newline separators as HTML elements.
            let looks_like_html = text.as_bytes().windows(2).enumerate().any(|(index, pair)| {
                pair[0] == b'<' && pair[1].is_ascii_alphabetic() && text[index + 2..].contains('>')
            });
            let html = if looks_like_html {
                text.to_owned()
            } else {
                text.replace('\n', "")
            };
            return Html::parse_fragment(&html).root_element().text().collect();
        }
        value
            .get("content")
            .or_else(|| value.get("blocks"))
            .and_then(Value::as_array)
            .map(|children| children.iter().map(extract).collect())
            .unwrap_or_default()
    }
    serde_json::from_str(json)
        .map(|value| extract(&value))
        .unwrap_or_default()
}

fn make(text: &[u16], start: usize, end: usize) -> ReviewAnchor {
    let mut prefix_start = start.saturating_sub(40);
    let mut suffix_end = (end + 40).min(text.len());
    if text
        .get(prefix_start)
        .is_some_and(|unit| (0xdc00..=0xdfff).contains(unit))
    {
        prefix_start += 1;
    }
    if suffix_end > end && (0xd800..=0xdbff).contains(&text[suffix_end - 1]) {
        suffix_end -= 1;
    }
    ReviewAnchor {
        version: 1,
        start,
        end,
        quote: String::from_utf16_lossy(&text[start..end]),
        prefix: String::from_utf16_lossy(&text[prefix_start..start]),
        suffix: String::from_utf16_lossy(&text[end..suffix_end]),
        document_hash: Some(document_hash(text)),
    }
}

fn document_hash(text: &[u16]) -> String {
    format!(
        "{:08x}",
        text.iter()
            .fold(0x811c9dc5u32, |hash, unit| (hash ^ u32::from(*unit))
                .wrapping_mul(16777619))
    )
}

pub fn parse(json: &str) -> Option<ReviewAnchor> {
    let anchor: ReviewAnchor = serde_json::from_str(json).ok()?;
    (anchor.version == 1
        && anchor.end > anchor.start
        && anchor.end - anchor.start == anchor.quote.encode_utf16().count()
        && anchor.prefix.encode_utf16().count() <= 40
        && anchor.suffix.encode_utf16().count() <= 40
        && anchor.document_hash.as_ref().is_none_or(|hash| {
            hash.len() == 8
                && hash
                    .bytes()
                    .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
        }))
    .then_some(anchor)
}

pub fn valid_for(json: &str, text: &str, quote: &str) -> bool {
    let Some(anchor) = parse(json) else {
        return false;
    };
    let text: Vec<u16> = text.encode_utf16().collect();
    anchor.quote == quote
        && anchor.end <= text.len()
        && text[anchor.start..anchor.end] == quote.encode_utf16().collect::<Vec<_>>()
        && anchor
            .document_hash
            .as_deref()
            .is_none_or(|hash| hash == document_hash(&text))
}

pub fn reconcile(json: Option<&str>, quote: &str, text: &str) -> Option<String> {
    let json = json?;
    if quote.is_empty() {
        return None;
    }
    let text: Vec<u16> = text.encode_utf16().collect();
    let needle: Vec<u16> = quote.encode_utf16().collect();
    let old = parse(json);
    if quote == "Capítulo" && old.is_none() {
        return None;
    }
    if let Some(anchor) = &old {
        if anchor.document_hash.as_deref() == Some(document_hash(&text).as_str())
            && anchor.end <= text.len()
            && text[anchor.start..anchor.end] == needle
        {
            return serde_json::to_string(&make(&text, anchor.start, anchor.end)).ok();
        }
    }
    let mut candidates: Vec<(usize, usize)> = text
        .windows(needle.len())
        .enumerate()
        .filter(|(_, window)| *window == needle.as_slice())
        .map(|(start, _)| {
            let score = old
                .as_ref()
                .map(|anchor| {
                    let prefix: Vec<u16> = anchor.prefix.encode_utf16().collect();
                    let suffix: Vec<u16> = anchor.suffix.encode_utf16().collect();
                    let end = start + needle.len();
                    text[..start]
                        .iter()
                        .rev()
                        .zip(prefix.iter().rev())
                        .take_while(|(a, b)| a == b)
                        .count()
                        + text[end..]
                            .iter()
                            .zip(suffix.iter())
                            .take_while(|(a, b)| a == b)
                            .count()
                })
                .unwrap_or(0);
            (start, score)
        })
        .collect();
    candidates.sort_by(|a, b| b.1.cmp(&a.1));
    let &(start, score) = candidates.first()?;
    if candidates.get(1).is_some_and(|other| other.1 == score) {
        return None;
    }
    serde_json::to_string(&make(&text, start, start + needle.len())).ok()
}
