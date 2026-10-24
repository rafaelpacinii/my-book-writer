use super::{
    tests::{chapter, snapshot},
    *,
};
use serde_json::json;
use std::io::{Cursor, Read};

fn entries(bytes: &[u8]) -> std::collections::HashMap<String, Vec<u8>> {
    let mut archive = zip::ZipArchive::new(Cursor::new(bytes)).unwrap();
    (0..archive.len())
        .map(|index| {
            let mut entry = archive.by_index(index).unwrap();
            let mut bytes = Vec::new();
            entry.read_to_end(&mut bytes).unwrap();
            (entry.name().to_string(), bytes)
        })
        .collect()
}

fn xml(files: &std::collections::HashMap<String, Vec<u8>>, name: &str) -> String {
    String::from_utf8(files[name].clone()).unwrap()
}

fn assert_xml(bytes: &[u8]) {
    let mut reader = quick_xml::Reader::from_reader(bytes);
    loop {
        match reader.read_event().unwrap() {
            quick_xml::events::Event::Eof => break,
            _ => {}
        }
    }
}

#[test]
fn empty_chapters_identify_the_chapter_in_every_format() {
    for value in [
        json!({"version":1,"type":"doc","blocks":[]}),
        json!({"content":[]}),
        json!({"html":"<p><br></p>"}),
        json!({"html":"<p>&nbsp;\u{200b}</p>"}),
        json!({"text":" \n\t"}),
    ] {
        let mut book = snapshot();
        book.chapters
            .push(chapter("empty", "O capítulo esquecido", ""));
        book.chapters[1].content_json = value.to_string();
        let issues = validation::issues(&book);
        assert_eq!(issues.len(), 1);
        assert_eq!(issues[0].chapter_id.as_deref(), Some("empty"));
        for result in [
            html::render_book(&book).map(|_| ()),
            docx::render_docx(&book).map(|_| ()),
            epub::render_epub(&book).map(|_| ()),
        ] {
            let error = result.unwrap_err().to_string();
            assert!(
                error.contains("capítulo 2 “O capítulo esquecido” está vazio"),
                "{error}"
            );
            assert!(error.contains("Escreva e salve"));
        }
    }
}

#[test]
fn invalid_documents_and_images_preserve_the_chapter_context() {
    for (content, reason) in [
        ("invalid", "dados inválidos"),
        ("{}", "não reconhecido"),
        (
            r#"{"html":"<p>Uma foto<img src='file:///tmp/image.png'></p>"}"#,
            "imagens",
        ),
    ] {
        let mut book = snapshot();
        book.chapters[0].content_json = content.into();
        for format in [
            validation::ExportFormat::Pdf,
            validation::ExportFormat::Epub,
            validation::ExportFormat::Docx,
        ] {
            let error = validation::validate(&book, format).unwrap_err().to_string();
            assert!(error.contains("Primeiro capítulo"));
            assert!(error.contains(reason), "{error}");
        }
    }
}

#[test]
fn preflight_lists_all_chapters_without_modifying_their_content() {
    let mut book = snapshot();
    book.chapters[0].content_json = "{\"blocks\":[]}".into();
    book.chapters
        .push(chapter("second", "Segundo", "<p><br></p>"));
    let original = book.chapters[0].content_json.clone();
    let issues = validation::issues(&book);
    assert_eq!(issues.len(), 2);
    assert_ne!(issues[0].chapter_id, issues[1].chapter_id);
    assert_eq!(book.chapters[0].content_json, original);
}

#[test]
fn legacy_blocks_are_exported_and_page_validation_is_format_specific() {
    let mut book = snapshot();
    book.chapters[0].content_json =
        json!({"blocks":[{"blocks":[{"text":"Texto legado"}]}]}).to_string();
    assert!(html::render_book(&book).unwrap().contains("Texto legado"));
    assert!(docx::render_docx(&book).is_ok());
    assert!(epub::render_epub(&book).is_ok());
    book.book.margin_left_um = i64::MAX;
    assert!(html::render_book(&book)
        .unwrap_err()
        .to_string()
        .contains("margens"));
    assert!(docx::render_docx(&book)
        .unwrap_err()
        .to_string()
        .contains("margens"));
    assert!(epub::render_epub(&book).is_ok());
}

#[test]
fn legacy_fallback_matches_the_editor_and_preserves_nested_paragraphs() {
    assert_eq!(
        content::chapter_html(&json!({"html":"", "text":"Texto legado"}).to_string()).unwrap(),
        "<p>Texto legado</p>"
    );
    let nested = json!({"blocks":[{"blocks":[
        {"type":"paragraph","content":[{"type":"text","text":"Primeiro"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Segundo"}]}
    ]}]})
    .to_string();
    assert_eq!(
        content::chapter_html(&nested).unwrap(),
        "<p>Primeiro</p><p>Segundo</p>"
    );
    assert!(content::chapter_html(
        &json!({"html":"<table><tr><td>Dados</td></tr></table>"}).to_string()
    )
    .unwrap_err()
    .to_string()
    .contains("tabelas"));
}

#[test]
fn docx_uses_pdf_typography_and_keeps_paragraphs_and_inline_formatting() {
    let mut book = snapshot();
    book.chapters[0].content_json = json!({"html":"<div><p style='text-align:right'>Primeiro<br>linha seguinte <b>forte</b></p><p><i>Segundo</i> <u>riscado</u> <s>excluído</s></p></div>Texto solto"}).to_string();
    let files = entries(&docx::render_docx(&book).unwrap());
    for (name, bytes) in &files {
        if name.ends_with(".xml") || name.ends_with(".rels") {
            assert_xml(bytes);
        }
    }
    let document = xml(&files, "word/document.xml");
    assert!(document.contains("w:w=\"7937\" w:h=\"11906\""));
    assert!(document.contains("w:top=\"1574\""));
    assert!(document.contains("w:bottom=\"1574\""));
    assert!(document.contains("w:after=\"275\""));
    assert!(document.contains("w:line=\"308\""));
    assert!(document.contains("w:lineRule=\"exact\""));
    assert!(document.contains("Merriweather 24pt"));
    assert!(document.contains("w:val=\"right\""));
    assert!(document.contains("w:type=\"textWrapping\""));
    assert!(
        document.contains("<w:b />")
            && document.contains("<w:i />")
            && document.contains("<w:u w:val=\"single\"")
    );
    assert!(document.contains("<w:strike"));
    assert!(document.contains("Texto solto"));
    let header = files
        .iter()
        .find(|(name, _)| name.starts_with("word/header"))
        .unwrap();
    assert!(String::from_utf8_lossy(header.1).contains("LIVRO DE EXPORTAÇÃO"));
    let footer = files
        .iter()
        .find(|(name, _)| name.starts_with("word/footer"))
        .unwrap();
    assert!(String::from_utf8_lossy(footer.1).contains("PAGE"));
}

#[test]
fn docx_embeds_all_selected_font_faces_with_reversible_keys() {
    let book = snapshot();
    let files = entries(&docx::render_docx(&book).unwrap());
    let font_table = xml(&files, "word/fontTable.xml");
    let mut reader = quick_xml::Reader::from_str(&font_table);
    let mut keys = Vec::new();
    loop {
        match reader.read_event().unwrap() {
            quick_xml::events::Event::Empty(event) => {
                for attribute in event.attributes().flatten() {
                    if attribute.key.as_ref() == "w:fontKey" {
                        keys.push(
                            uuid::Uuid::parse_str(attribute.value.trim_matches(['{', '}']))
                                .unwrap(),
                        );
                    }
                }
            }
            quick_xml::events::Event::Eof => break,
            _ => {}
        }
    }
    let faces = fonts::font_faces(&book.font.family_name).unwrap();
    assert_eq!(keys.len(), faces.len());
    for (index, ((original, _, _), key)) in faces.iter().zip(&keys).enumerate() {
        let embedded = &files[&format!("word/fonts/font{index}.odttf")];
        let mut decoded = embedded.clone();
        for index in 0..32 {
            decoded[index] ^= key.as_bytes()[15 - index % 16];
        }
        assert_eq!(decoded, *original);
    }
    assert!(xml(&files, "word/settings.xml").contains("w:updateFields"));
}

#[test]
fn docx_keeps_lists_links_and_superscript_content() {
    let mut book = snapshot();
    book.chapters[0].content_json = json!({"html":"<ul><li>Primeiro</li><li><p>Segundo</p><p>Continuação</p></li></ul><ol><li>Um</li><li>Dois</li></ol><p><a href='https://example.com'>Um <b>link</b></a> x<sup>2</sup> a<sub>i</sub></p><blockquote><p>Citação</p></blockquote>"}).to_string();
    let files = entries(&docx::render_docx(&book).unwrap());
    let document = xml(&files, "word/document.xml");
    assert_eq!(document.matches("• ").count(), 2);
    assert!(document.contains(">1. </w:t>") && document.contains(">2. </w:t>"));
    assert!(document.contains("Continuação"));
    assert!(document.contains("<w:hyperlink"));
    assert!(document.contains("w:val=\"superscript\""));
    assert!(document.contains("w:val=\"subscript\""));
    assert!(xml(&files, "word/_rels/document.xml.rels").contains("https://example.com"));
}

#[test]
fn a_metadata_failure_does_not_turn_a_saved_file_into_a_failed_export() {
    tauri::async_runtime::block_on(async {
        let book = snapshot();
        let bytes = docx::render_docx(&book).unwrap();
        let folder = tempfile::tempdir().unwrap();
        let destination = folder.path().join("livro.docx");
        output::save_docx(&destination, &bytes).unwrap();
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        pool.close().await;
        let warning = output::record_saved(&pool, &book.book.id).await.unwrap();
        assert!(warning.contains("O arquivo foi salvo"));
        assert_eq!(std::fs::read(destination).unwrap(), bytes);
    });
}

#[test]
fn invalid_docx_does_not_replace_an_existing_file_and_unsupported_fonts_are_actionable() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("livro.docx");
    std::fs::write(&path, b"original").unwrap();
    assert!(output::save_docx(&path, b"invalid").is_err());
    assert_eq!(std::fs::read(path).unwrap(), b"original");
    let mut book = snapshot();
    book.font.family_name = "Fonte desconhecida".into();
    assert!(validation::issues(&book)
        .iter()
        .any(|issue| issue.code == "page_layout" && issue.message.contains("fonte")));
    assert!(docx::render_docx(&book).is_err());
    assert!(epub::render_epub(&book).is_ok());
}

pub(super) fn sample() -> crate::repositories::export_repository::BookExportSnapshot {
    let mut book = snapshot();
    book.book.title = "Entre páginas e caminhos".into();
    book.chapters[0].content_json = json!({"html":format!("<p>Um começo discreto, seguido por uma nova linha.<br>A história continua aqui.</p><p style='text-align:center'><b>Uma pausa no caminho</b></p>{}<p><i>O fim de um começo.</i></p>", "<p>A autora percorreu as ruas em silêncio. As janelas refletiam a luz da manhã, enquanto cada encontro lhe lembrava que as histórias nascem de pequenos detalhes, de escolhas e de caminhos que se cruzam.</p>".repeat(15))}).to_string();
    book.chapters.push(chapter("second", "O retorno", "<p>Outro capítulo, com <b>negrito</b>, <i>itálico</i>, <u>sublinhado</u> e uma quebra.<br>Este texto começa na linha seguinte.</p>"));
    book.front_matter = Some(serde_json::from_value(json!({
        "book_id":"export-test", "include_half_title":true, "include_title_page":true,
        "subtitle":"Uma edição de teste", "publisher":"Editora Horizonte", "edition":"1ª edição",
        "publication_year":2026, "publication_city":"Curitiba", "include_copyright_page":true,
        "copyright_text":"© 2026 Autora. Todos os direitos reservados.",
        "include_dedication":true, "dedication_text":"A quem escreve todos os dias.",
        "include_epigraph":true, "epigraph_text":"O caminho se faz ao caminhar.", "epigraph_author":"Autora",
        "include_table_of_contents":true, "created_at":"", "updated_at":""
    })).unwrap());
    book
}

#[test]
fn front_matter_uses_sections_and_real_docx_fields_and_epub_links() {
    let book = sample();
    let files = entries(&docx::render_docx(&book).unwrap());
    let document = xml(&files, "word/document.xml");
    assert!(document.contains("w:vAlign w:val=\"center\""));
    assert!(document.contains("w:vAlign w:val=\"bottom\""));
    assert!(document.contains("PAGEREF MBWChapter0"));
    assert!(document.contains("TOC"));
    assert!(document.contains("w:name=\"MBWChapter0\""));
    assert!(document.contains("O caminho se faz ao caminhar."));
    let epub = entries(&epub::render_epub(&book).unwrap());
    for (name, bytes) in &epub {
        if name.ends_with(".xhtml") || name.ends_with(".opf") || name.ends_with(".ncx") {
            assert_xml(bytes);
        }
    }
    let toc = epub
        .iter()
        .find(|(name, _)| name.ends_with("/toc.xhtml"))
        .unwrap();
    let toc = String::from_utf8_lossy(toc.1);
    assert!(toc.contains("chapter_001.xhtml"));
    assert!(toc.contains("chapter_002.xhtml"));
    let opf = epub
        .iter()
        .find(|(name, _)| name.ends_with(".opf"))
        .unwrap();
    assert!(String::from_utf8_lossy(opf.1).contains("version=\"3.0\""));
}

#[test]
fn file_names_and_extensions_are_valid_on_supported_platforms() {
    for extension in ["pdf", "epub", "docx"] {
        assert_eq!(
            output::suggested_filename("CON", extension),
            format!("_CON.{extension}")
        );
        assert_eq!(
            output::suggested_filename(" ... ", extension),
            format!("Livro.{extension}")
        );
        assert!(output::validate_extension(
            std::path::Path::new(&format!("Livro.{}", extension.to_uppercase())),
            extension
        )
        .is_ok());
        assert!(output::validate_extension(std::path::Path::new("Livro.txt"), extension).is_err());
    }
}

#[test]
#[ignore = "requires prepared local Chromium; generates fictional comparison files in /tmp"]
fn export_audit_sample_files() {
    let book = sample();
    let destination = std::env::var_os("MBW_EXPORT_AUDIT_DIR")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| std::env::temp_dir().join("my-book-writer-export-audit"));
    std::fs::create_dir_all(&destination).unwrap();
    let html = html::render_book(&book).unwrap();
    let binary =
        chromium::executable(&std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("resources"))
            .unwrap();
    let pdf = chromium::render_pdf(&binary, &html).unwrap();
    std::fs::write(destination.join("referencia.pdf"), &pdf).unwrap();
    std::fs::write(
        destination.join("livro.docx"),
        docx::render_docx(&book).unwrap(),
    )
    .unwrap();
    std::fs::write(
        destination.join("livro.epub"),
        epub::render_epub(&book).unwrap(),
    )
    .unwrap();
    let document = lopdf::Document::load_mem(&pdf).unwrap();
    assert!(document.get_pages().len() >= 10);
    let compatibility = destination.join("word-compatibility");
    std::fs::create_dir_all(&compatibility).unwrap();
    for family in [
        "Merriweather",
        "Inter",
        "EB Garamond",
        "Crimson Pro",
        "Libre Baskerville",
        "Libre Caslon Text",
    ] {
        let mut book = sample();
        book.font.family_name = family.into();
        book.chapters[1].content_json = json!({"html":"<h2>Formatação</h2><ul><li>Um</li><li><p>Dois</p><p>Continuação</p></li></ul><ol><li>Primeiro</li><li>Segundo</li></ol><p style='text-align:right'><b>Negrito</b> <i>Itálico</i> <u>Sublinhado</u> <s>Tachado</s><br>x<sup>2</sup> a<sub>i</sub> &amp; <a href='https://example.com'>link</a></p><blockquote><p>Uma citação.</p></blockquote>"}).to_string();
        let filename = format!("{}.docx", family.replace(' ', "-").to_lowercase());
        std::fs::write(
            compatibility.join(filename),
            docx::render_docx(&book).unwrap(),
        )
        .unwrap();
    }
}
