use super::validation::invalid;
use crate::error::AppError;
use base64::{engine::general_purpose::STANDARD, Engine};
use image::{GenericImageView, ImageFormat, ImageReader, Limits};
use sha2::{Digest, Sha256};
use std::io::Cursor;

pub(super) struct PreparedImage {
    pub bytes: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub mime: &'static str,
    pub extension: &'static str,
    pub hash: String,
}
pub(super) fn prepare(data: &str) -> Result<PreparedImage, AppError> {
    if data.len() > 14_000_000 {
        return Err(invalid("Use imagens de até 10 MB"));
    }
    let raw = data
        .split_once(',')
        .filter(|(header, _)| header.starts_with("data:image/") && header.ends_with(";base64"))
        .ok_or_else(|| invalid("Escolha uma imagem PNG, JPEG ou WebP válida"))?
        .1;
    let bytes = STANDARD
        .decode(raw)
        .map_err(|_| invalid("A imagem está inválida"))?;
    if bytes.is_empty() || bytes.len() > 10 * 1024 * 1024 {
        return Err(invalid("Use imagens de até 10 MB"));
    }
    let format = image::guess_format(&bytes).map_err(|_| invalid("A imagem está inválida"))?;
    let (mime, extension) = match format {
        ImageFormat::Png => ("image/png", "png"),
        ImageFormat::Jpeg => ("image/jpeg", "jpg"),
        ImageFormat::WebP => ("image/webp", "webp"),
        _ => return Err(invalid("Use imagens PNG, JPEG ou WebP")),
    };
    let mut reader = ImageReader::with_format(Cursor::new(&bytes), format);
    let mut limits = Limits::default();
    limits.max_image_width = Some(8192);
    limits.max_image_height = Some(8192);
    limits.max_alloc = Some(128 * 1024 * 1024);
    reader.limits(limits);
    let decoded = reader
        .decode()
        .map_err(|_| invalid("A imagem está inválida ou ultrapassa 8192 pixels"))?;
    let (width, height) = decoded.dimensions();
    let hash = Sha256::digest(&bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect();
    Ok(PreparedImage {
        bytes,
        width,
        height,
        mime,
        extension,
        hash,
    })
}
pub(super) fn data_url(bytes: &[u8]) -> Result<String, AppError> {
    let mime =
        match image::guess_format(bytes).map_err(|_| invalid("A imagem salva está inválida"))? {
            ImageFormat::Png => "image/png",
            ImageFormat::Jpeg => "image/jpeg",
            ImageFormat::WebP => "image/webp",
            _ => return Err(invalid("Formato de imagem indisponível")),
        };
    Ok(format!("data:{mime};base64,{}", STANDARD.encode(bytes)))
}
