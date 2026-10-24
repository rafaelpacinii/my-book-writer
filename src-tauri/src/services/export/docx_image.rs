use super::{docx_layout::Typography, media};
use crate::error::AppError;
use docx_rs::Pic;
use scraper::ElementRef;

pub fn picture(element: ElementRef<'_>, typography: &Typography<'_>) -> Result<Pic, AppError> {
    let image = media::decode(element.value().attr("src").unwrap_or(""))?;
    let width = media::dimension(element, "width").unwrap_or(image.width) as f64 * 0.75;
    let height = media::dimension(element, "height")
        .map(|height| height as f64 * 0.75)
        .unwrap_or(width * image.height as f64 / image.width as f64);
    let scale = (typography.width / width)
        .min((typography.height - typography.size * 2.0).max(1.0) / height)
        .min(1.0);
    Ok(
        Pic::new_with_dimensions(image.bytes, image.width, image.height).size(
            (width * scale * 12700.0).round() as u32,
            (height * scale * 12700.0).round() as u32,
        ),
    )
}
