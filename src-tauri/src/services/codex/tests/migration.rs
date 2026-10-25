use super::*;
use serde_json::json;

#[test]
fn existing_database_upgrades_without_changing_books_or_chapters() {
    tauri::async_runtime::block_on(async {
        let directory = tempfile::tempdir().unwrap();
        for migration in std::fs::read_dir("migrations").unwrap() {
            let migration = migration.unwrap();
            if migration.file_name().to_string_lossy().as_ref() < "20261025010000_create_codex.sql"
            {
                std::fs::copy(
                    migration.path(),
                    directory.path().join(migration.file_name()),
                )
                .unwrap();
            }
        }
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate::Migrator::new(directory.path())
            .await
            .unwrap()
            .run(&pool)
            .await
            .unwrap();
        let before = sqlx::query("SELECT * FROM local_profiles")
            .fetch_all(&pool)
            .await
            .unwrap()
            .len();
        let (profile, format, font): (String, String, String) = sqlx::query_as(
            "SELECT p.id,f.id,t.id FROM local_profiles p,book_formats f,font_presets t LIMIT 1",
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        let book = BookService::new(&pool).create_book(serde_json::from_value(json!({
            "profile_id":profile,"format_id":format,"font_preset_id":font,"title":"Antes do Códice","author_name":"Autora"
        })).unwrap()).await.unwrap();
        let original = serde_json::to_value(&book).unwrap();
        let chapters = crate::services::chapter_service::ChapterService::new(&pool);
        let chapter = chapters
            .create_chapter(
                serde_json::from_value(json!({ "book_id":book.id,
            "title":"Capítulo preservado","content_json":"{\"type\":\"doc\",\"blocks\":[]}" }))
                .unwrap(),
            )
            .await
            .unwrap();
        let original_chapter = serde_json::to_value(&chapter).unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        assert_eq!(
            sqlx::query("SELECT * FROM local_profiles")
                .fetch_all(&pool)
                .await
                .unwrap()
                .len(),
            before
        );
        let restored = BookService::new(&pool)
            .get_book_by_id(&book.id)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(serde_json::to_value(restored).unwrap(), original);
        assert_eq!(
            serde_json::to_value(
                chapters
                    .get_chapter_by_id(&chapter.id)
                    .await
                    .unwrap()
                    .unwrap()
            )
            .unwrap(),
            original_chapter
        );
        assert_eq!(
            CodexService::new(&pool)
                .list_templates(&profile, None)
                .await
                .unwrap()
                .len(),
            3
        );
    });
}

#[test]
fn promotion_failure_rolls_back_book_and_series_membership() {
    tauri::async_runtime::block_on(async {
        for through_series in [false, true] {
            let f = fixture().await;
            let sheet = f.create(CodexKind::Character, "Pessoa").await;
            let series = crate::services::series_service::SeriesService::new(&f.pool)
                .create_series(
                    serde_json::from_value(json!({"profile_id":f.profile,"name":"Saga"})).unwrap(),
                )
                .await
                .unwrap();
            if through_series {
                BookService::new(&f.pool)
                    .update_book(
                        &f.book,
                        serde_json::from_value(json!({"series_id":series.id})).unwrap(),
                    )
                    .await
                    .unwrap();
            }
            sqlx::raw_sql("CREATE TRIGGER fail_codex_promotion BEFORE UPDATE OF universe_id ON codex_entities BEGIN SELECT RAISE(ABORT,'injected failure'); END;")
                .execute(&f.pool).await.unwrap();
            if through_series {
                assert!(crate::services::series_service::SeriesService::new(&f.pool)
                    .update_series(
                        &series.id,
                        serde_json::from_value(json!({"universe_id":f.universe})).unwrap()
                    )
                    .await
                    .is_err());
                let world: Option<String> =
                    sqlx::query_scalar("SELECT universe_id FROM book_series WHERE id=?")
                        .bind(series.id)
                        .fetch_one(&f.pool)
                        .await
                        .unwrap();
                assert!(world.is_none());
            } else {
                assert!(BookService::new(&f.pool)
                    .update_book(
                        &f.book,
                        serde_json::from_value(json!({"universe_id":f.universe})).unwrap()
                    )
                    .await
                    .is_err());
            }
            let world: Option<String> =
                sqlx::query_scalar("SELECT universe_id FROM books WHERE id=?")
                    .bind(&f.book)
                    .fetch_one(&f.pool)
                    .await
                    .unwrap();
            assert!(world.is_none());
            assert_eq!(
                f.service()
                    .get_sheet(f.scope(), &sheet.entity.id)
                    .await
                    .unwrap()
                    .entity
                    .book_id,
                Some(f.book)
            );
        }
    });
}

#[test]
fn database_rejects_invalid_scope_and_migrations_can_be_rechecked() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let sheet = f.create(CodexKind::Location, "Lugar").await;
        assert!(
            sqlx::query("UPDATE codex_entities SET universe_id=? WHERE id=?")
                .bind(&f.universe)
                .bind(&sheet.entity.id)
                .execute(&f.pool)
                .await
                .is_err()
        );
        assert!(
            sqlx::query("UPDATE codex_fields SET value_json='broken' WHERE id=?")
                .bind(&sheet.fields[0].id)
                .execute(&f.pool)
                .await
                .is_err()
        );
        sqlx::migrate!("./migrations").run(&f.pool).await.unwrap();
        let violations = sqlx::query("PRAGMA foreign_key_check")
            .fetch_all(&f.pool)
            .await
            .unwrap();
        assert!(violations.is_empty());
    });
}
