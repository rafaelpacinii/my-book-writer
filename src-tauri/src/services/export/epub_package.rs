use crate::error::AppError;
use std::io::{Cursor, Read, Write};
use zip::{write::SimpleFileOptions, ZipArchive, ZipWriter};

// epub-builder 0.8.3 assigns the creator ID prefix to languages too. Keep
// creator refinements intact and put the language IDs in their own namespace.
pub fn finish(bytes: &[u8]) -> Result<Vec<u8>, AppError> {
    repair(bytes).map_err(|error| {
        super::export_error("Não foi possível finalizar os metadados do EPUB.", error)
    })
}

fn repair(bytes: &[u8]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut archive = ZipArchive::new(Cursor::new(bytes))?;
    let mut output = ZipWriter::new(Cursor::new(Vec::new()));
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index)?;
        let mut contents = Vec::new();
        entry.read_to_end(&mut contents)?;
        if entry.name().ends_with(".opf") {
            contents = String::from_utf8(contents)?
                .replace(
                    "<dc:language id=\"epub-creator-",
                    "<dc:language id=\"epub-language-",
                )
                .into_bytes();
        }
        output.start_file(
            entry.name(),
            SimpleFileOptions::default().compression_method(entry.compression()),
        )?;
        output.write_all(&contents)?;
    }
    Ok(output.finish()?.into_inner())
}
