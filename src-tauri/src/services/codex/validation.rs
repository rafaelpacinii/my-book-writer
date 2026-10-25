use crate::domain::codex::*;
use crate::error::AppError;
use serde_json::{json, Value};

pub(super) fn label(value: &str) -> Result<String, AppError> {
    let value = value.trim();
    if value.is_empty() || value.chars().count() > 160 {
        return Err(invalid("O nome deve conter entre 1 e 160 caracteres"));
    }
    Ok(value.into())
}
pub(super) fn invalid(message: &str) -> AppError {
    AppError::Validation(message.into())
}
pub(super) fn writable(scope: &CodexScope) -> Result<(), AppError> {
    if scope.is_archived {
        return Err(invalid(
            "Este Códice está arquivado; seus dados continuam disponíveis para consulta",
        ));
    }
    Ok(())
}
pub(super) fn text(value: String) -> Result<Option<String>, AppError> {
    if value.len() > 40_000 {
        return Err(invalid("O texto ultrapassa o limite de 40.000 bytes"));
    }
    Ok(if value.trim().is_empty() {
        None
    } else {
        Some(value.trim().into())
    })
}
pub(super) fn tags(values: Vec<String>) -> Result<Vec<String>, AppError> {
    if values.len() > 100 {
        return Err(invalid("Use no máximo 100 tags ou vínculos"));
    }
    let mut result = Vec::new();
    for value in values {
        let value = label(&value)?;
        if !result.contains(&value) {
            result.push(value);
        }
    }
    Ok(result)
}
pub(super) fn field(value: &CodexFieldInput) -> Result<(), AppError> {
    if !value.config.is_object()
        || value.config.to_string().len() > 32_768
        || value.value.to_string().len() > 1_048_576
    {
        return Err(invalid("Configuração ou conteúdo do campo inválido"));
    }
    let valid = match value.field_type {
        CodexFieldType::ShortText => value
            .value
            .as_str()
            .is_some_and(|s| s.chars().count() <= 1_000),
        CodexFieldType::LongText => value.value.is_string(),
        CodexFieldType::Tags | CodexFieldType::Reference => {
            value.value.as_array().is_some_and(|items| {
                items.len() <= 100
                    && items.iter().all(|item| {
                        item.as_str()
                            .is_some_and(|s| !s.trim().is_empty() && s.chars().count() <= 160)
                    })
            })
        }
        CodexFieldType::Scale => value
            .value
            .as_f64()
            .is_some_and(|n| n.is_finite() && (0.0..=100.0).contains(&n)),
        CodexFieldType::Document => {
            value.value.get("type").and_then(Value::as_str) == Some("doc")
                && value.value.get("content").is_some_and(Value::is_array)
        }
    };
    if !valid {
        return Err(invalid("O valor não corresponde ao tipo do campo"));
    }
    Ok(())
}
pub(super) fn empty_value(kind: CodexFieldType) -> Value {
    match kind {
        CodexFieldType::ShortText | CodexFieldType::LongText => json!(""),
        CodexFieldType::Tags | CodexFieldType::Reference => json!([]),
        CodexFieldType::Scale => json!(0),
        CodexFieldType::Document => json!({"type":"doc","content":[]}),
    }
}
