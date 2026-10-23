use super::*;
use crate::services::chapter_version_service::ChapterVersionService;
use sqlx::sqlite::SqlitePoolOptions;

async fn setup() -> (SqlitePool, String) {
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
            r#"{"html":"<p>Primeiro trecho. Segundo trecho.</p>"}"#,
        )
        .await
        .unwrap();
    let profile = sqlx::query_scalar("SELECT id FROM local_profiles LIMIT 1")
        .fetch_one(&pool)
        .await
        .unwrap();
    (pool, profile)
}

fn note(profile: &str) -> CreateCommentInput {
    CreateCommentInput {
        chapter_id: "c1".into(),
        author_profile_id: profile.into(),
        body: "Anotação".into(),
        original_excerpt: "Capítulo".into(),
        anchor_json: None,
        anchor_revision: 0,
    }
}

fn progress(profile: &str, revision: i64) -> MarkProgressInput {
    MarkProgressInput {
        chapter_id: "c1".into(),
        profile_id: profile.into(),
        anchor_json: Some(r#"{"completed":true}"#.into()),
        anchor_revision: revision,
        reviewed_content_revision: revision,
        needs_recheck: false,
    }
}

#[test]
fn completion_requires_current_content_and_resolved_comments() {
    tauri::async_runtime::block_on(async {
        let (pool, profile) = setup().await;
        let service = ReviewService::new(&pool);
        assert!(service
            .mark_progress(progress(&profile, 999))
            .await
            .is_err());
        let comment = service.create_comment(note(&profile)).await.unwrap();
        assert!(service.mark_progress(progress(&profile, 0)).await.is_err());
        let resolved = service.resolve_comment(&comment.id).await.unwrap();
        assert!(resolved.resolved_at.is_some());
        assert!(
            !service
                .mark_progress(progress(&profile, 0))
                .await
                .unwrap()
                .needs_recheck
        );
        service.reopen_comment(&comment.id).await.unwrap();
        assert!(
            service
                .get_progress("c1")
                .await
                .unwrap()
                .unwrap()
                .needs_recheck
        );
        service.resolve_comment(&comment.id).await.unwrap();
        service.mark_progress(progress(&profile, 0)).await.unwrap();
        ChapterVersionService::new(&pool)
            .save_with_history("c1", 0, r#"{"html":"<p>Outro texto.</p>"}"#)
            .await
            .unwrap();
        assert!(
            service
                .get_progress("c1")
                .await
                .unwrap()
                .unwrap()
                .needs_recheck
        );
        assert!(service.mark_progress(progress(&profile, 0)).await.is_err());
        assert!(
            !service
                .mark_progress(progress(&profile, 1))
                .await
                .unwrap()
                .needs_recheck
        );
    });
}

#[test]
fn restoration_invalidates_review_and_preserves_removed_excerpt() {
    tauri::async_runtime::block_on(async {
        let (pool, profile) = setup().await;
        let versions = ChapterVersionService::new(&pool);
        let snapshot = versions.create_version("c1", None).await.unwrap();
        versions
            .save_with_history("c1", 0, r#"{"html":"<p>Texto novo.</p>"}"#)
            .await
            .unwrap();
        let service = ReviewService::new(&pool);
        let mut input = note(&profile);
        input.anchor_revision = 1;
        input.original_excerpt = "Texto novo.".into();
        input.anchor_json = Some(
            r#"{"version":1,"start":0,"end":11,"quote":"Texto novo.","prefix":"","suffix":""}"#
                .into(),
        );
        let comment = service.create_comment(input).await.unwrap();
        service.resolve_comment(&comment.id).await.unwrap();
        service.mark_progress(progress(&profile, 1)).await.unwrap();
        versions
            .restore_version("c1", &snapshot.id, 1)
            .await
            .unwrap();
        assert!(
            service
                .get_progress("c1")
                .await
                .unwrap()
                .unwrap()
                .needs_recheck
        );
        let comment = &service.list_comments("c1").await.unwrap()[0];
        assert_eq!(comment.anchor_state, "removed");
        assert_eq!(comment.original_excerpt, "Texto novo.");
        assert_eq!(comment.status, "resolved");
    });
}

#[test]
fn invalid_inputs_and_deleted_chapters_are_rejected_without_raw_database_errors() {
    tauri::async_runtime::block_on(async {
        let (pool, profile) = setup().await;
        let service = ReviewService::new(&pool);
        let mut input = note(&profile);
        input.anchor_json = Some("invalid-json".into());
        assert!(service.create_comment(input).await.is_err());
        let comment = service.create_comment(note(&profile)).await.unwrap();
        assert!(service.update_comment(&comment.id, " ").await.is_err());
        assert!(service
            .create_comment(CreateCommentInput {
                anchor_revision: 1,
                ..note(&profile)
            })
            .await
            .is_err());
        assert!(service
            .create_comment(CreateCommentInput {
                author_profile_id: "missing".into(),
                ..note(&profile)
            })
            .await
            .is_err());
        assert_eq!(
            review_error(service.resolve_comment("missing").await.unwrap_err()),
            "Comentário não encontrado."
        );
        ChapterRepository::new(&pool)
            .soft_delete("c1")
            .await
            .unwrap();
        assert!(service.create_comment(note(&profile)).await.is_err());
        assert!(service.list_comments("c1").await.is_err());
        assert!(service.resolve_comment(&comment.id).await.is_err());
        assert!(service.get_progress("c1").await.is_err());
    });
}

#[test]
fn anchors_follow_context_and_utf16_offsets_without_attaching_ambiguous_legacy_quotes() {
    let anchor = r#"{"version":1,"start":8,"end":13,"quote":"trecho","prefix":"😀 início ","suffix":" fim"}"#;
    // Invalid UTF-16 length must not be accepted.
    assert!(review_anchor::parse(anchor).is_none());
    let anchor = r#"{"version":1,"start":10,"end":16,"quote":"trecho","prefix":"😀 início ","suffix":" fim"}"#;
    assert!(review_anchor::valid_for(
        anchor,
        "😀 início trecho fim",
        "trecho"
    ));
    let anchored = anchor.replace(
        "\"version\":1",
        "\"version\":1,\"document_hash\":\"6a0a94b2\"",
    );
    assert!(review_anchor::valid_for(
        &anchored,
        "😀 início trecho fim",
        "trecho"
    ));
    assert!(!review_anchor::valid_for(
        &anchored.replace("6a0a94b2", "00000000"),
        "😀 início trecho fim",
        "trecho"
    ));
    let shifted =
        review_anchor::reconcile(Some(anchor), "trecho", "Novo 😀 início trecho fim").unwrap();
    assert!(review_anchor::valid_for(
        &shifted,
        "Novo 😀 início trecho fim",
        "trecho"
    ));
    assert!(review_anchor::reconcile(Some("{}"), "igual", "igual igual").is_none());
    assert!(review_anchor::reconcile(Some(anchor), "trecho", "removido").is_none());
}

#[test]
fn review_and_anchor_changes_roll_back_with_failed_content_save() {
    tauri::async_runtime::block_on(async {
        let (pool, profile) = setup().await;
        let service = ReviewService::new(&pool);
        service.mark_progress(progress(&profile, 0)).await.unwrap();
        let versions = ChapterVersionService::new(&pool);
        versions.set_track_changes("c1", true).await.unwrap();
        sqlx::query("CREATE TRIGGER reject_history BEFORE INSERT ON chapter_versions BEGIN SELECT RAISE(ABORT, 'injected failure'); END").execute(&pool).await.unwrap();
        let json = serde_json::json!({"text":vec!["mudança";40].join(" ")}).to_string();
        assert!(versions.save_with_history("c1", 0, &json).await.is_err());
        assert!(
            !service
                .get_progress("c1")
                .await
                .unwrap()
                .unwrap()
                .needs_recheck
        );
        assert_eq!(
            ChapterRepository::new(&pool)
                .find_by_id("c1")
                .await
                .unwrap()
                .unwrap()
                .content_revision,
            0
        );
    });
}
