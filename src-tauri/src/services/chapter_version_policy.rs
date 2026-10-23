use scraper::Html;
use serde_json::Value;

pub fn is_restorable(json: &str) -> bool {
    serde_json::from_str::<Value>(json).is_ok_and(|document| {
        document.get("text").and_then(Value::as_str).is_some()
            || document.get("html").and_then(Value::as_str).is_some()
            || document.get("content").and_then(Value::as_array).is_some()
            || document.get("blocks").and_then(Value::as_array).is_some()
    })
}

pub fn plain_text(json: &str) -> String {
    fn extract(value: &Value) -> String {
        if let Some(text) = value.get("text").and_then(Value::as_str) {
            return text.to_owned();
        }
        if let Some(html) = value.get("html").and_then(Value::as_str) {
            return Html::parse_fragment(html)
                .root_element()
                .text()
                .collect::<Vec<_>>()
                .join(" ");
        }
        ["content", "blocks"]
            .iter()
            .filter_map(|key| value.get(key).and_then(Value::as_array))
            .flatten()
            .map(extract)
            .collect::<Vec<_>>()
            .join(" ")
    }
    serde_json::from_str::<Value>(json)
        .map(|value| extract(&value))
        .unwrap_or_default()
}

/// Extrai a contagem de palavras do JSON canônico de forma simples
pub fn word_count(json: &str) -> i64 {
    plain_text(json).split_whitespace().count() as i64
}

pub fn needs_snapshot(before: &str, after: &str, seconds: i64) -> bool {
    if before == after {
        return false;
    }
    if seconds >= 180 {
        return true;
    }
    let old_text = plain_text(before);
    let new_text = plain_text(after);
    let old: Vec<_> = old_text.split_whitespace().collect();
    let new: Vec<_> = new_text.split_whitespace().collect();
    let prefix = old.iter().zip(&new).take_while(|(a, b)| a == b).count();
    let suffix = old[prefix..]
        .iter()
        .rev()
        .zip(new[prefix..].iter().rev())
        .take_while(|(a, b)| a == b)
        .count();
    old.len().max(new.len()) - prefix - suffix >= 30
}
