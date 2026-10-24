pub mod chromium;
mod content;
mod devtools;
pub mod docx;
mod docx_blocks;
mod docx_content;
mod docx_front_matter;
mod docx_image;
mod docx_layout;
mod docx_lists;
mod docx_package;
mod docx_render;
mod docx_table;
mod docx_xml;
pub mod epub;
mod epub_media;
mod epub_package;
mod fonts;
pub mod html;
mod layout;
mod media;
mod output;
pub mod pdf;
mod pdf_toc;
mod validation;

#[cfg(test)]
mod audit_tests;
#[cfg(test)]
mod fidelity_tests;
#[cfg(test)]
mod tests;

use crate::error::AppError;

fn export_error(context: &str, error: impl std::fmt::Display) -> AppError {
    eprintln!("Book export: {context}: {error}");
    AppError::Export(context.into())
}

pub fn frontend_error(error: AppError) -> String {
    match error {
        AppError::Database(error) => {
            eprintln!("Book export: database: {error}");
            "Não foi possível ler os dados do livro para exportação.".into()
        }
        error => error.to_string(),
    }
}
