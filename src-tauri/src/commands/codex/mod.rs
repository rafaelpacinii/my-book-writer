pub mod entities;
pub mod scopes;
pub mod templates;

use crate::error::AppError;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CodexCommandError {
    pub code: &'static str,
    pub message: String,
}

impl From<AppError> for CodexCommandError {
    fn from(error: AppError) -> Self {
        match error {
            AppError::Validation(message) => Self {
                code: "validation",
                message,
            },
            AppError::NotFound(message) => Self {
                code: "not_found",
                message,
            },
            _ => Self {
                code: "storage",
                message: "Não foi possível acessar o Códice local. Tente novamente.".into(),
            },
        }
    }
}
