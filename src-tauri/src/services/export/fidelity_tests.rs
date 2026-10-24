use super::{
    audit_tests::{entries, sample, xml},
    tests::{chapter, snapshot},
    *,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::json;
use std::io::Cursor;

fn image_url(format: image::ImageFormat) -> String {
    let image = image::DynamicImage::ImageRgb8(image::RgbImage::from_pixel(
        96,
        48,
        image::Rgb([45, 85, 125]),
    ));
    let mut bytes = Cursor::new(Vec::new());
    image.write_to(&mut bytes, format).unwrap();
    format!(
        "data:{};base64,{}",
        format.to_mime_type(),
        STANDARD.encode(bytes.into_inner())
    )
}

fn paragraph<'a>(xml: &'a str, text: &str) -> &'a str {
    xml.split("</w:p>")
        .find(|paragraph| paragraph.contains(text))
        .unwrap()
        .rsplit("<w:p ")
        .next()
        .unwrap()
}

#[test]
fn docx_keeps_inherited_block_styles_and_child_overrides() {
    let mut book = snapshot();
    book.chapters[0].content_json = json!({"html":"<div style='text-align:center;font-weight:bold;font-style:italic'><p>Herdado</p><p style='text-align:left;font-weight:normal;font-style:normal'>Normal</p><div><p>Descendente</p></div></div>"}).to_string();
    let files = entries(&docx::render_docx(&book).unwrap());
    let document = xml(&files, "word/document.xml");
    for text in ["Herdado", "Descendente"] {
        let paragraph = paragraph(&document, text);
        assert!(paragraph.contains("w:val=\"center\""), "{paragraph}");
        assert!(paragraph.contains("<w:b />") && paragraph.contains("<w:i />"));
    }
    let normal = paragraph(&document, "Normal");
    assert!(normal.contains("w:val=\"left\""));
    assert!(!normal.contains("<w:b />") && !normal.contains("<w:i />"));
}

#[test]
fn docx_lists_use_native_numbering_with_restarts_and_continuations() {
    let mut book = snapshot();
    book.chapters[0].content_json = json!({"html":"<ol start='5'><li><p>Quinto</p><p>Continuação</p><ul><li>Aninhado</li></ul></li><li value='9'>Nono</li><li>Décimo</li></ol><ol><li>Reiniciado</li></ol>"}).to_string();
    let files = entries(&docx::render_docx(&book).unwrap());
    let document = xml(&files, "word/document.xml");
    assert_eq!(document.matches("<w:numPr>").count(), 5);
    assert!(!paragraph(&document, "Continuação").contains("<w:numPr>"));
    assert!(paragraph(&document, "Aninhado").contains("w:val=\"1\""));
    let numbering = xml(&files, "word/numbering.xml");
    assert!(numbering.contains("<w:start w:val=\"5\""));
    assert!(numbering.contains("<w:start w:val=\"9\""));
    assert!(numbering.contains("w:val=\"bullet\""));
    assert!(!document.contains(">5. </w:t>"));
}

pub(super) fn rich_html() -> String {
    format!("<div style='text-align:center;font-weight:bold'><p>Formatação herdada</p></div><p><img src='{}' alt='Retângulo azul' width='192' height='96'></p><table><caption>Tabela de exemplo</caption><thead><tr><th colspan='2'>Cabeçalho</th></tr></thead><tbody><tr><td rowspan='2'><b>Mesclada</b><ul><li>Item na célula</li></ul></td><td>Primeira</td></tr><tr><td>Segunda</td></tr></tbody></table><ol start='3'><li>Terceiro</li><li>Quarto</li></ol>", image_url(image::ImageFormat::Png))
}

#[test]
fn tables_and_images_are_preserved_in_all_three_formats() {
    let mut book = snapshot();
    book.chapters[0].content_json = json!({"html":rich_html()}).to_string();
    let html = html::render_book(&book).unwrap();
    assert!(
        html.contains("<table>")
            && html.contains("rowspan=\"2\"")
            && html.contains("data:image/png;base64,")
    );
    let files = entries(&docx::render_docx(&book).unwrap());
    let document = xml(&files, "word/document.xml");
    assert!(document.contains("<w:tbl>") && document.contains("<w:gridSpan w:val=\"2\""));
    assert!(
        document.contains("<w:vMerge w:val=\"restart\"")
            && document.contains("<w:vMerge w:val=\"continue\"")
    );
    assert!(document.contains("w:lineRule=\"atLeast\""));
    assert!(document.contains("<w:drawing>"));
    assert!(document.contains("descr=\"Retângulo azul\""));
    assert!(paragraph(&document, "Tabela de exemplo").contains("w:val=\"center\""));
    assert_eq!(
        files
            .keys()
            .filter(|name| name.starts_with("word/media/") && name.ends_with(".png"))
            .count(),
        1
    );
    let files = entries(&epub::render_epub(&book).unwrap());
    let chapter = files
        .iter()
        .find(|(name, _)| name.ends_with("chapter_001.xhtml"))
        .unwrap();
    let content = String::from_utf8_lossy(chapter.1);
    assert!(content.contains("<table>") && content.contains("images/chapter-0-0.png"));
    assert!(!content.contains("data:image"));
    assert!(files.contains_key("OEBPS/images/chapter-0-0.png"));
    assert!(xml(&files, "OEBPS/content.opf").contains("epub-language-0"));
}

#[test]
fn image_only_chapters_are_valid_and_corrupt_or_remote_images_identify_the_chapter() {
    for format in [
        image::ImageFormat::Png,
        image::ImageFormat::Jpeg,
        image::ImageFormat::Gif,
        image::ImageFormat::WebP,
    ] {
        let mut book = snapshot();
        book.chapters[0].content_json =
            json!({"html":format!("<p><img src='{}' alt='Imagem'></p>", image_url(format))})
                .to_string();
        html::render_book(&book).unwrap();
        assert!(docx::render_docx(&book).is_ok());
        assert!(epub::render_epub(&book).is_ok());
    }
    for source in [
        "https://example.com/image.png",
        "file:///tmp/image.png",
        "data:image/png;base64,AAAA",
        "data:image/svg+xml;base64,AAAA",
    ] {
        let mut book = snapshot();
        book.chapters[0].content_json = json!({"html":format!("<img src='{source}'>")}).to_string();
        let issues = validation::issues(&book);
        assert_eq!(issues[0].chapter_id.as_deref(), Some("primeiro"));
        assert!(issues[0].message.contains("Primeiro capítulo"));
    }
}

#[test]
#[ignore = "requires prepared local Chromium; verifies actual destinations and rich exports"]
fn rich_exports_use_real_pdf_pages_and_keep_content() {
    let mut book = sample();
    book.chapters[0].content_json = json!({"html":format!("{}{}", rich_html(), "<p>Uma história que continua por muitas páginas, com escolhas e encontros.</p>".repeat(80))}).to_string();
    for index in 0..40 {
        book.chapters.push(chapter(
            &format!("chapter-{index}"),
            &format!("Capítulo extra {index}: um título longo para ocupar o sumário"),
            "<p>Conteúdo de outro capítulo.</p>",
        ));
    }
    let binary =
        chromium::executable(&std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("resources"))
            .unwrap();
    let bytes = chromium::render_pdf(&binary, &html::render_book(&book).unwrap()).unwrap();
    let pages = pdf_toc::chapter_pages(&bytes, book.chapters.len()).unwrap();
    let document = lopdf::Document::load_mem(&bytes).unwrap();
    for (index, page) in pages.iter().enumerate() {
        let text = document.extract_text(&[*page]).unwrap();
        assert!(
            text.split_whitespace()
                .collect::<Vec<_>>()
                .join(" ")
                .contains(&book.chapters[index].title),
            "Chapter {index} missing from page {page}"
        );
    }
    let all_text = document
        .extract_text(&document.get_pages().keys().copied().collect::<Vec<_>>())
        .unwrap();
    assert!(all_text.contains("Mesclada") && all_text.contains("Segunda"));
    let folder = std::env::temp_dir().join("my-book-writer-export-fidelity");
    std::fs::create_dir_all(&folder).unwrap();
    std::fs::write(folder.join("referencia.pdf"), bytes).unwrap();
    std::fs::write(folder.join("livro.docx"), docx::render_docx(&book).unwrap()).unwrap();
    std::fs::write(folder.join("livro.epub"), epub::render_epub(&book).unwrap()).unwrap();
    std::fs::write(
        folder.join("expected-pages.json"),
        serde_json::to_vec(&pages).unwrap(),
    )
    .unwrap();
}
