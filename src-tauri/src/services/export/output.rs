use crate::error::AppError;
use std::io::Write;
use std::path::Path;

pub fn suggested_filename(title: &str, extension: &str) -> String {
    let name: String = title
        .chars()
        .map(|character| {
            if character.is_control() || "<>:\"/\\|?*".contains(character) {
                '_'
            } else {
                character
            }
        })
        .take(100)
        .collect();
    let name = name.trim().trim_matches('.').trim();
    let stem = name.split('.').next().unwrap_or("").to_ascii_uppercase();
    let reserved = matches!(stem.as_str(), "CON" | "PRN" | "AUX" | "NUL")
        || (stem.len() == 4
            && (stem.starts_with("COM") || stem.starts_with("LPT"))
            && stem.ends_with(['1', '2', '3', '4', '5', '6', '7', '8', '9']));
    format!(
        "{}{}.{extension}",
        if reserved { "_" } else { "" },
        if name.is_empty() { "Livro" } else { name }
    )
}

pub fn validate_extension(path: &Path, extension: &str) -> Result<(), AppError> {
    if path
        .extension()
        .is_none_or(|value| !value.eq_ignore_ascii_case(extension))
    {
        return Err(AppError::Export(format!(
            "O nome do arquivo deve terminar em .{extension}."
        )));
    }
    Ok(())
}

pub async fn record_saved(pool: &sqlx::SqlitePool, book_id: &str) -> Option<String> {
    match crate::repositories::book_repository::touch_book(pool, book_id).await {
        Ok(()) => None,
        Err(error) => {
            eprintln!("Book export: file saved, metadata update failed: {error}");
            Some(
                "O arquivo foi salvo, mas não foi possível atualizar a data de acesso ao livro."
                    .into(),
            )
        }
    }
}

pub fn save_pdf(destination: &Path, bytes: &[u8]) -> Result<(), AppError> {
    if !bytes.starts_with(b"%PDF-") || bytes.len() < 100 {
        return Err(AppError::Export(
            "O arquivo gerado não é um PDF válido.".into(),
        ));
    }
    let parent = destination
        .parent()
        .filter(|path| path.is_dir())
        .ok_or_else(|| AppError::Export("A pasta escolhida não está disponível.".into()))?;
    // A failed export must leave an existing destination untouched.
    let mut file = tempfile::NamedTempFile::new_in(parent).map_err(|e| {
        super::export_error("Não foi possível preparar o arquivo na pasta escolhida.", e)
    })?;
    file.write_all(bytes)
        .and_then(|_| file.as_file().sync_all())
        .map_err(|e| {
            super::export_error(
                "Não foi possível gravar o PDF. Verifique o espaço disponível.",
                e,
            )
        })?;
    file.persist(destination)
        .map_err(|e| super::export_error("Não foi possível salvar o PDF na pasta escolhida.", e))?;
    Ok(())
}

pub fn save_epub(destination: &Path, bytes: &[u8]) -> Result<(), AppError> {
    if !bytes.starts_with(b"PK\x03\x04") || bytes.len() < 100 {
        return Err(AppError::Export(
            "O arquivo gerado não é um EPUB válido.".into(),
        ));
    }
    let parent = destination
        .parent()
        .filter(|path| path.is_dir())
        .ok_or_else(|| AppError::Export("A pasta escolhida não está disponível.".into()))?;
    let mut file = tempfile::NamedTempFile::new_in(parent).map_err(|e| {
        super::export_error("Não foi possível preparar o arquivo na pasta escolhida.", e)
    })?;
    file.write_all(bytes)
        .and_then(|_| file.as_file().sync_all())
        .map_err(|e| {
            super::export_error(
                "Não foi possível gravar o EPUB. Verifique o espaço disponível.",
                e,
            )
        })?;
    file.persist(destination).map_err(|e| {
        super::export_error("Não foi possível salvar o EPUB na pasta escolhida.", e)
    })?;
    Ok(())
}

pub fn save_docx(destination: &Path, bytes: &[u8]) -> Result<(), AppError> {
    if !bytes.starts_with(b"PK\x03\x04") || bytes.len() < 100 {
        return Err(AppError::Export(
            "O arquivo gerado não é um documento DOCX válido.".into(),
        ));
    }
    let parent = destination
        .parent()
        .filter(|path| path.is_dir())
        .ok_or_else(|| AppError::Export("A pasta escolhida não está disponível.".into()))?;
    let mut file = tempfile::NamedTempFile::new_in(parent).map_err(|e| {
        super::export_error("Não foi possível preparar o arquivo na pasta escolhida.", e)
    })?;
    file.write_all(bytes)
        .and_then(|_| file.as_file().sync_all())
        .map_err(|e| {
            super::export_error(
                "Não foi possível gravar o DOCX. Verifique o espaço disponível.",
                e,
            )
        })?;
    file.persist(destination).map_err(|e| {
        super::export_error("Não foi possível salvar o DOCX na pasta escolhida.", e)
    })?;
    Ok(())
}
