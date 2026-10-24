use super::content::escape_html;
use crate::error::AppError;
use base64::{engine::general_purpose::STANDARD, Engine};
use scraper::ElementRef;
use std::io::Cursor;

pub struct Image {
    pub bytes: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

pub fn decode(source: &str) -> Result<Image, AppError> {
    let (header, encoded) = source.split_once(',').ok_or_else(|| AppError::Export(
        "Uma imagem não está incorporada ao capítulo. Cole uma imagem local em PNG, JPEG, GIF ou WebP; links externos não funcionam offline.".into(),
    ))?;
    if !matches!(
        header.to_ascii_lowercase().as_str(),
        "data:image/png;base64"
            | "data:image/jpeg;base64"
            | "data:image/jpg;base64"
            | "data:image/gif;base64"
            | "data:image/webp;base64"
    ) {
        return Err(AppError::Export(
            "Formato de imagem não suportado. Use PNG, JPEG, GIF ou WebP incorporado ao capítulo."
                .into(),
        ));
    }
    if encoded.len() > 35 * 1024 * 1024 {
        return Err(AppError::Export(
            "Uma imagem excede o limite de 25 MB. Reduza a imagem antes de exportar.".into(),
        ));
    }
    let bytes = STANDARD.decode(encoded).map_err(|error| {
        super::export_error(
            "Uma imagem contém dados Base64 inválidos. Insira a imagem novamente.",
            error,
        )
    })?;
    if bytes.len() > 25 * 1024 * 1024 {
        return Err(AppError::Export(
            "Uma imagem excede o limite de 25 MB.".into(),
        ));
    }
    let mut reader = image::ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|error| {
            super::export_error("Não foi possível reconhecer uma imagem do capítulo.", error)
        })?;
    let mut limits = image::Limits::default();
    limits.max_image_width = Some(16384);
    limits.max_image_height = Some(16384);
    limits.max_alloc = Some(128 * 1024 * 1024);
    reader.limits(limits);
    let image = reader.decode().map_err(|error| super::export_error("Uma imagem está danificada ou excede as dimensões permitidas. Reduza ou insira a imagem novamente.", error))?;
    let (width, height) = (image.width(), image.height());
    let mut output = Cursor::new(Vec::new());
    image
        .write_to(&mut output, image::ImageFormat::Png)
        .map_err(|error| {
            super::export_error(
                "Não foi possível preparar uma imagem para exportação.",
                error,
            )
        })?;
    Ok(Image {
        bytes: output.into_inner(),
        width,
        height,
    })
}

pub fn html(element: ElementRef<'_>) -> Result<String, AppError> {
    let image = decode(element.value().attr("src").unwrap_or(""))?;
    let width = dimension(element, "width").unwrap_or(image.width);
    let height = dimension(element, "height").unwrap_or_else(|| {
        ((image.height as f64 * width as f64 / image.width as f64).round() as u32).max(1)
    });
    let alt = escape_html(element.value().attr("alt").unwrap_or(""));
    Ok(format!("<img src=\"data:image/png;base64,{}\" alt=\"{alt}\" width=\"{width}\" height=\"{height}\">", STANDARD.encode(image.bytes)))
}

pub fn dimension(element: ElementRef<'_>, name: &str) -> Option<u32> {
    let css = element
        .value()
        .attr("style")
        .unwrap_or("")
        .split(';')
        .rev()
        .filter_map(|declaration| declaration.split_once(':'))
        .find_map(|(key, value)| {
            if key.trim() != name {
                return None;
            }
            value
                .trim()
                .strip_suffix("px")
                .and_then(|value| value.trim().parse::<f64>().ok())
                .filter(|value| value.is_finite() && (1.0..=16384.0).contains(value))
                .map(|value| value.round() as u32)
        });
    if css.is_some() {
        return css;
    }
    element
        .value()
        .attr(name)
        .and_then(|value| value.parse::<u32>().ok())
        .filter(|value| (1..=16384).contains(value))
}
