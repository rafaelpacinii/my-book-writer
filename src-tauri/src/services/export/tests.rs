use super::{content::chapter_html, html::render_book, output::save_pdf};
use crate::domain::{
    catalog::{BookFormat, FontPreset},
    chapter::Chapter,
};
use crate::repositories::export_repository::BookExportSnapshot;
use serde_json::json;

fn snapshot() -> BookExportSnapshot {
    BookExportSnapshot {
        book: serde_json::from_value(json!({
            "id":"export-test", "profile_id":"profile", "format_id":"format", "font_preset_id":"font",
            "title":"Livro de exportação", "author_name":"Autora", "card_image_asset_id":null, "position":0,
            "font_size_pt":11.0, "line_height_ratio":1.4, "margin_top_um":20000, "margin_bottom_um":20000,
            "margin_left_um":20000, "margin_right_um":20000, "created_at":"2026-10-05", "updated_at":"2026-10-05", "deleted_at":null,
        })).unwrap(),
        format: BookFormat { id:"format".into(), name:"14 × 21 cm".into(), market:"BR".into(), width_um:140000, height_um:210000, is_active:true },
        font: FontPreset { id:"font".into(), name:"Merriweather".into(), family_name:"Merriweather".into(), manifest_path:String::new(), is_active:true },
        chapters: vec![chapter("primeiro", "Primeiro capítulo", "<p>Olá, mundo! <b>Negrito</b>, <i>itálico</i> e <u>sublinhado</u>.</p>")],
    }
}

fn chapter(id: &str, title: &str, html: &str) -> Chapter {
    Chapter {
        id: id.into(),
        book_id: "export-test".into(),
        title: title.into(),
        position: 0,
        content_json: json!({"type":"doc", "html":html}).to_string(),
        content_schema_version: 1,
        content_revision: 1,
        track_changes_enabled: false,
        created_at: String::new(),
        updated_at: String::new(),
        deleted_at: None,
    }
}

#[test]
fn sanitizes_active_content_without_losing_formatting() {
    let html = chapter_html(&json!({"html":"<p onclick='alert(1)' style='text-align:center;background:url(file:///etc/passwd)'>Texto <b>forte</b><script>alert(1)</script></p><iframe src='https://example.com'></iframe>"}).to_string()).unwrap();
    assert_eq!(
        html,
        "<p style=\"text-align:center\">Texto <b>forte</b></p>"
    );
}

#[test]
fn escapes_plain_text_and_supports_legacy_structured_content() {
    assert_eq!(
        chapter_html(&json!({"text":"<script> & título\ncontinua"}).to_string()).unwrap(),
        "<p>&lt;script&gt; &amp; título<br>continua</p>"
    );
    assert_eq!(
        chapter_html(
            &json!({"content":[{"content":[{"text":"Um "},{"text":"livro"}]}]}).to_string()
        )
        .unwrap(),
        "<p>Um livro</p>"
    );
}

#[test]
fn removes_automatic_breaks_and_redundant_empty_blocks() {
    let html = chapter_html(&json!({"html":format!("<p>Começo</p>{}<p>Fim</p>{}<div data-page-break='true'></div>", "<p><br></p>".repeat(50), "<div><br></div>".repeat(100))}).to_string()).unwrap();
    assert_eq!(html, "<p>Começo</p><p><br></p><p>Fim</p>");
}

#[test]
fn nested_blanks_and_excessive_line_breaks_do_not_generate_empty_pages() {
    let source = format!(
        "<div><p>Começo</p>{}</div><p>Fim{}continua</p>",
        "<p><br></p>".repeat(100),
        "<br>".repeat(200)
    );
    assert_eq!(
        chapter_html(&json!({"html":source}).to_string()).unwrap(),
        "<div><p>Começo</p></div><p>Fim<br><br>continua</p>"
    );
    assert_eq!(
        chapter_html(&json!({"html":"<p>Texto</p><hr>"}).to_string()).unwrap(),
        "<p>Texto</p><hr>"
    );
}

#[test]
fn rejects_invalid_documents_and_unsupported_images_explicitly() {
    assert!(chapter_html("invalid JSON").is_err());
    assert!(chapter_html(
        &json!({"html":"<p>Foto<img src='file:///tmp/private.png'></p>"}).to_string()
    )
    .is_err());
}

#[test]
fn physical_dimensions_and_metadata_are_escaped() {
    let mut book = snapshot();
    book.book.title = "Título </style><script>alert(1)</script>".into();
    book.chapters[0].title = "<b>Capítulo</b>".into();
    let document = render_book(&book).unwrap();
    assert!(document.contains("size: 140mm 210mm"));
    assert!(document.contains("&lt;b&gt;Capítulo&lt;/b&gt;"));
    assert!(!document.contains("<script>"));
    assert!(document.contains("data:font/ttf;base64,"));
}

#[test]
fn rejects_empty_books_and_impossible_page_settings() {
    let mut book = snapshot();
    book.chapters.clear();
    assert!(render_book(&book).is_err());
    book = snapshot();
    book.book.margin_left_um = book.format.width_um;
    assert!(render_book(&book).is_err());
}

#[test]
fn failed_pdf_does_not_replace_an_existing_file() {
    let directory = tempfile::tempdir().unwrap();
    let destination = directory.path().join("livro.pdf");
    std::fs::write(&destination, "original").unwrap();
    assert!(save_pdf(&destination, b"invalid").is_err());
    assert_eq!(std::fs::read(&destination).unwrap(), b"original");
}

#[test]
fn snapshot_contains_full_content_in_order_and_excludes_deleted_chapters() {
    tauri::async_runtime::block_on(async {
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        let books = crate::repositories::book_repository::BookRepository::new(&pool);
        books
            .create(
                "export-test",
                "019213bc-0000-7000-8000-000000000001",
                "fmt-br-14x21",
                "font-merriweather",
                "Livro",
                "Autora",
                None,
                0,
                11.0,
                1.4,
                20000,
                20000,
                20000,
                20000,
            )
            .await
            .unwrap();
        let chapters = crate::repositories::chapter_repository::ChapterRepository::new(&pool);
        chapters
            .create(
                "later",
                "export-test",
                "Segundo",
                1,
                "{\"html\":\"<p>Último</p>\"}",
            )
            .await
            .unwrap();
        chapters
            .create(
                "first",
                "export-test",
                "Primeiro",
                0,
                "{\"html\":\"<p>Completo</p>\"}",
            )
            .await
            .unwrap();
        chapters
            .create("deleted", "export-test", "Excluído", 0, "{}")
            .await
            .unwrap();
        chapters.soft_delete("deleted").await.unwrap();
        let snapshot = crate::repositories::export_repository::read_snapshot(&pool, "export-test")
            .await
            .unwrap();
        assert_eq!(
            snapshot
                .chapters
                .iter()
                .map(|chapter| chapter.id.as_str())
                .collect::<Vec<_>>(),
            ["first", "later"]
        );
        assert!(snapshot.chapters[0].content_json.contains("Completo"));
        assert_eq!(snapshot.format.width_um, 140000);
        assert_eq!(snapshot.font.family_name, "Merriweather");
        books.soft_delete("export-test").await.unwrap();
        assert!(
            crate::repositories::export_repository::read_snapshot(&pool, "export-test")
                .await
                .is_err()
        );
        pool.close().await;
    });
}

#[test]
#[ignore = "requires the local Chromium runtime prepared by npm run pdf:prepare"]
fn chromium_exports_real_pdf_offline() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("resources");
    let binary = super::chromium::executable(&root).unwrap();
    let mut book = snapshot();
    book.chapters[0].content_json = json!({"html":format!("<p>Olá, mundo! <b>Negrito</b> <i>itálico</i>.</p>{}", "<p><br></p>".repeat(500))}).to_string();
    book.chapters.push(chapter(
        "segundo",
        "Segundo capítulo",
        "<p>Fim do livro.</p>",
    ));
    let bytes = super::chromium::render_pdf(&binary, &render_book(&book).unwrap()).unwrap();
    let document = lopdf::Document::load_mem(&bytes).unwrap();
    let pages = document.get_pages();
    assert_eq!(
        pages.len(),
        2,
        "trailing blanks must not create extra pages"
    );
    let text = document.extract_text(&[1, 2]).unwrap();
    assert!(text.contains("Olá, mundo!"));
    assert!(text.contains("Negrito"));
    assert!(text.contains("Segundo capítulo"));
    assert!(text.contains("Fim do livro."));
    assert!(!text.contains("about:blank"));
    let page = document.get_object(pages[&1]).unwrap().as_dict().unwrap();
    let media_box = page.get(b"MediaBox").unwrap().as_array().unwrap();
    assert!((media_box[2].as_float().unwrap() - 140.0 * 72.0 / 25.4).abs() < 1.0);
    assert!((media_box[3].as_float().unwrap() - 210.0 * 72.0 / 25.4).abs() < 1.0);
    let fonts: Vec<_> = document
        .objects
        .values()
        .filter_map(|object| object.as_dict().ok())
        .filter_map(|dictionary| dictionary.get(b"FontFile2").ok())
        .collect();
    assert!(
        fonts.len() >= 3,
        "regular, bold and italic fonts must be embedded"
    );
    let folder = tempfile::tempdir().unwrap();
    let target = folder.path().join("Meu livro.pdf");
    save_pdf(&target, &bytes).unwrap();
    assert_eq!(std::fs::read(&target).unwrap(), bytes);
}

#[test]
#[ignore = "requires the local Chromium runtime prepared by npm run pdf:prepare"]
fn chromium_respects_formats_and_fonts_and_keeps_long_paragraphs() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("resources");
    let binary = super::chromium::executable(&root).unwrap();
    for (family, size) in [
        ("Merriweather", 11.0),
        ("Inter", 16.0),
        ("EB Garamond", 14.0),
        ("Crimson Pro", 12.0),
        ("Libre Baskerville", 13.0),
        ("Libre Caslon Text", 11.0),
    ] {
        let mut book = snapshot();
        book.font.family_name = family.into();
        book.book.font_size_pt = size;
        book.book.margin_left_um = 20321;
        book.book.margin_right_um = 15000;
        book.book.line_height_ratio = 1.6;
        book.format.width_um = 152400;
        book.format.height_um = 228600;
        book.chapters[0].content_json = json!({"html":format!("<p>INÍCIOÚNICO {} FINALÚNICO</p>", "Uma história com acentos, diálogos — e personagens que atravessa várias páginas. ".repeat(300))}).to_string();
        let bytes = super::chromium::render_pdf(&binary, &render_book(&book).unwrap()).unwrap();
        let document = lopdf::Document::load_mem(&bytes).unwrap();
        let pages = document.get_pages();
        assert!(pages.len() > 2, "long paragraphs must span pages: {family}");
        let text = document
            .extract_text(&pages.keys().copied().collect::<Vec<_>>())
            .unwrap();
        assert!(text.contains("INÍCIOÚNICO"), "missing first text: {family}");
        assert!(text.contains("FINALÚNICO"), "missing last text: {family}");
        for page_id in pages.values() {
            let page = document.get_object(*page_id).unwrap().as_dict().unwrap();
            let bounds = page.get(b"MediaBox").unwrap().as_array().unwrap();
            assert!((bounds[2].as_float().unwrap() - 432.0).abs() < 1.0);
            assert!((bounds[3].as_float().unwrap() - 648.0).abs() < 1.0);
        }
    }
}
