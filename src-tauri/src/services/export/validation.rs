use super::{content, layout};
use crate::{
    domain::chapter::Chapter, error::AppError, repositories::export_repository::BookExportSnapshot,
};
use serde::Serialize;

#[derive(Clone, Copy, Debug, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Pdf,
    Epub,
    Docx,
}

#[derive(Debug, Serialize)]
pub struct ExportIssue {
    pub code: &'static str,
    pub message: String,
    pub chapter_id: Option<String>,
    pub formats: Vec<ExportFormat>,
}

pub fn chapter_content(chapter: &Chapter, index: usize) -> Result<String, AppError> {
    let label = format!(
        "O capítulo {} “{}”",
        index + 1,
        if chapter.title.trim().is_empty() {
            "Sem título"
        } else {
            chapter.title.trim()
        }
    );
    let html = content::chapter_html(&chapter.content_json)
        .map_err(|error| AppError::Export(format!("{label}: {}", super::frontend_error(error))))?;
    if !content::has_visible_text(&html) {
        return Err(AppError::Export(format!(
            "{label} está vazio. Escreva e salve o texto ou remova o capítulo antes de exportar."
        )));
    }
    Ok(html)
}

pub fn issues(snapshot: &BookExportSnapshot) -> Vec<ExportIssue> {
    let mut issues = Vec::new();
    let all = vec![ExportFormat::Pdf, ExportFormat::Epub, ExportFormat::Docx];
    if snapshot.chapters.is_empty() {
        issues.push(ExportIssue {
            code: "empty_book",
            message: "Adicione pelo menos um capítulo antes de exportar.".into(),
            chapter_id: None,
            formats: all.clone(),
        });
    }
    for (index, chapter) in snapshot.chapters.iter().enumerate() {
        if let Err(error) = chapter_content(chapter, index) {
            issues.push(ExportIssue {
                code: "chapter_content",
                message: error.to_string(),
                chapter_id: Some(chapter.id.clone()),
                formats: all.clone(),
            });
        }
    }
    if let Err(error) = layout::validate(snapshot) {
        issues.push(ExportIssue {
            code: "page_layout",
            message: error.to_string(),
            chapter_id: None,
            formats: vec![ExportFormat::Pdf, ExportFormat::Docx],
        });
    }
    if let Err(error) = super::fonts::font_faces(&snapshot.font.family_name) {
        issues.push(ExportIssue {
            code: "page_layout",
            message: error.to_string(),
            chapter_id: None,
            formats: vec![ExportFormat::Pdf, ExportFormat::Docx],
        });
    }
    issues
}

pub fn validate(snapshot: &BookExportSnapshot, format: ExportFormat) -> Result<(), AppError> {
    if let Some(issue) = issues(snapshot)
        .into_iter()
        .find(|issue| issue.formats.contains(&format))
    {
        return Err(AppError::Export(issue.message));
    }
    Ok(())
}
