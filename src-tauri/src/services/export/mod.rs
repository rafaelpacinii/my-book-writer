pub mod chromium;
mod content;
mod devtools;
mod fonts;
pub mod html;
mod output;
pub mod pdf;

#[cfg(test)]
mod tests;

use crate::error::AppError;

fn export_error(context: &str, error: impl std::fmt::Display) -> AppError {
    eprintln!("PDF export: {context}: {error}");
    AppError::Export(context.into())
}

pub fn frontend_error(error: AppError) -> String {
    match error {
        AppError::Database(error) => {
            eprintln!("PDF export: database: {error}");
            "Não foi possível ler os dados do livro para exportação.".into()
        }
        error => error.to_string(),
    }
}
