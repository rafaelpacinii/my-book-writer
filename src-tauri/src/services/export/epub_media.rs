use crate::error::AppError;
use epub_builder::{EpubBuilder, ZipLibrary};
use scraper::{Html, Selector};

pub fn embed(
    builder: &mut EpubBuilder<ZipLibrary>,
    html: &str,
    chapter: usize,
) -> Result<String, AppError> {
    let fragment = Html::parse_fragment(html);
    let selector = Selector::parse("img").expect("static selector");
    let mut output = html.to_string();
    for (index, element) in fragment.select(&selector).enumerate() {
        let image = super::media::decode(element.value().attr("src").unwrap_or(""))?;
        let path = format!("images/chapter-{chapter}-{index}.png");
        builder
            .add_resource(&path, image.bytes.as_slice(), "image/png")
            .map_err(|error| {
                super::export_error("Não foi possível incorporar uma imagem ao EPUB.", error)
            })?;
        let source = element.value().attr("src").unwrap_or("");
        output = output.replacen(&format!("src=\"{source}\""), &format!("src=\"{path}\""), 1);
    }
    Ok(output)
}
