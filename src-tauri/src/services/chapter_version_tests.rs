use super::*;
use crate::services::chapter_version_policy::{needs_snapshot, word_count};
use sqlx::sqlite::SqlitePoolOptions;

async fn setup() -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    sqlx::query("INSERT INTO books (id, profile_id, format_id, font_preset_id, title, author_name, position, font_size_pt, line_height_ratio, margin_top_um, margin_bottom_um, margin_left_um, margin_right_um, created_at, updated_at) VALUES ('b1', (SELECT id FROM local_profiles LIMIT 1), (SELECT id FROM book_formats LIMIT 1), (SELECT id FROM font_presets LIMIT 1), 'Livro', 'Autor', 0, 11, 1.4, 20000, 20000, 20000, 20000, datetime('now'), datetime('now'))").execute(&pool).await.unwrap();
    ChapterRepository::new(&pool)
        .create(
            "c1",
            "b1",
            "Capítulo",
            0,
            "standard",
            None,
            &document("texto original"),
        )
        .await
        .unwrap();
    pool
}

fn document(text: &str) -> String {
    serde_json::json!({"type":"doc", "text":text, "word_count":text.split_whitespace().count()})
        .to_string()
}

async fn reject_versions(pool: &SqlitePool) {
    sqlx::query("CREATE TRIGGER reject_history BEFORE INSERT ON chapter_versions BEGIN SELECT RAISE(ABORT, 'injected history failure'); END").execute(pool).await.unwrap();
}

#[test]
fn policy_reads_legacy_documents_and_same_length_rewrites() {
    assert_eq!(
        word_count(r#"{"content":[{"content":[{"text":"Era uma vez"}]}]}"#),
        3
    );
    assert_eq!(
        word_count(r#"{"html":"<p>Era uma vez</p><p>Outro texto</p>"}"#),
        5
    );
    let old = document(&vec!["antigo"; 30].join(" "));
    let new = document(&vec!["novo"; 30].join(" "));
    assert!(needs_snapshot(&old, &new, 0));
    assert!(!needs_snapshot(&old, &old, 999));
    assert!(needs_snapshot(&document("a"), &document("b"), 180));
}

#[test]
fn captures_real_content_and_never_reuses_deleted_numbers() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        let first = service.create_version("c1", Some("Marco")).await.unwrap();
        assert_eq!(first.word_count, 2);
        assert!(first.content_json.contains("texto original"));
        assert!(service.delete_version(&first.id).await.unwrap());
        let next = service.create_version("c1", None).await.unwrap();
        assert_eq!(next.version_number, 2);
        assert_ne!(next.id, first.id);
    });
}

#[test]
fn restoration_keeps_a_safety_copy_and_checks_the_viewed_revision() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        let version = service.create_version("c1", None).await.unwrap();
        service
            .save_with_history("c1", 0, &document("texto novo"))
            .await
            .unwrap();
        assert!(service.restore_version("c1", &version.id, 0).await.is_err());
        assert_eq!(service.list_versions("c1").await.unwrap().len(), 1);
        let restored = service.restore_version("c1", &version.id, 1).await.unwrap();
        assert_eq!(restored.content_revision, 2);
        assert_eq!(restored.content_json, version.content_json);
        let backup = service
            .get_version(&service.list_versions("c1").await.unwrap()[0].id)
            .await
            .unwrap()
            .unwrap();
        assert!(backup.content_json.contains("texto novo"));
    });
}

#[test]
fn restoration_rolls_back_if_the_safety_copy_cannot_be_saved() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        let version = service.create_version("c1", None).await.unwrap();
        let current = service
            .save_with_history("c1", 0, &document("preservar este texto"))
            .await
            .unwrap();
        reject_versions(&pool).await;
        assert!(service.restore_version("c1", &version.id, 1).await.is_err());
        let after = ChapterRepository::new(&pool)
            .find_by_id("c1")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(after.content_json, current.content_json);
        assert_eq!(after.content_revision, current.content_revision);
    });
}

#[test]
fn enabling_is_atomic_and_reenabling_records_a_new_baseline() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        reject_versions(&pool).await;
        assert!(service.set_track_changes("c1", true).await.is_err());
        assert!(
            !ChapterRepository::new(&pool)
                .find_by_id("c1")
                .await
                .unwrap()
                .unwrap()
                .track_changes_enabled
        );
        sqlx::query("DROP TRIGGER reject_history")
            .execute(&pool)
            .await
            .unwrap();
        service.set_track_changes("c1", true).await.unwrap();
        service.set_track_changes("c1", false).await.unwrap();
        service
            .save_with_history("c1", 0, &document("mudança com rastreamento desativado"))
            .await
            .unwrap();
        service.set_track_changes("c1", true).await.unwrap();
        assert_eq!(service.list_versions("c1").await.unwrap().len(), 2);
    });
}

#[test]
fn automatic_history_failure_rolls_back_without_revision_drift() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        service.set_track_changes("c1", true).await.unwrap();
        reject_versions(&pool).await;
        assert!(service
            .save_with_history("c1", 0, &document(&vec!["novo"; 35].join(" ")))
            .await
            .is_err());
        let current = ChapterRepository::new(&pool)
            .find_by_id("c1")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(current.content_revision, 0);
        assert!(current.content_json.contains("texto original"));
    });
}

#[test]
fn checkpoint_records_small_changes_after_typing_stops() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        service.set_track_changes("c1", true).await.unwrap();
        service
            .save_with_history("c1", 0, &document("pequena revisão"))
            .await
            .unwrap();
        assert!(service.checkpoint("c1").await.unwrap().is_none());
        sqlx::query("UPDATE chapter_versions SET created_at = datetime('now', '-181 seconds')")
            .execute(&pool)
            .await
            .unwrap();
        assert!(service.checkpoint("c1").await.unwrap().is_some());
        assert!(service.checkpoint("c1").await.unwrap().is_none());
    });
}

#[test]
fn versions_from_another_chapter_cannot_be_restored() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        let version = service.create_version("c1", None).await.unwrap();
        ChapterRepository::new(&pool)
            .create("c2", "b1", "Dois", 1, "standard", None, "{}")
            .await
            .unwrap();
        assert!(service.restore_version("c2", &version.id, 0).await.is_err());
        assert!(service.list_versions("c2").await.unwrap().is_empty());
    });
}

#[test]
fn malformed_historical_content_is_rejected_without_modifying_the_chapter() {
    tauri::async_runtime::block_on(async {
        let pool = setup().await;
        let service = ChapterVersionService::new(&pool);
        let version = service.create_version("c1", None).await.unwrap();
        sqlx::query("UPDATE chapter_versions SET content_json = 'invalid-json' WHERE id = ?")
            .bind(&version.id)
            .execute(&pool)
            .await
            .unwrap();
        assert!(service.restore_version("c1", &version.id, 0).await.is_err());
        let chapter = ChapterRepository::new(&pool)
            .find_by_id("c1")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(chapter.content_revision, 0);
        assert!(chapter.content_json.contains("texto original"));
        assert_eq!(service.list_versions("c1").await.unwrap().len(), 1);
    });
}
