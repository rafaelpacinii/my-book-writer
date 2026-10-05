use crate::error::AppError;
use std::io::Write;
use std::path::Path;

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
