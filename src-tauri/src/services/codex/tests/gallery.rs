use super::*;
use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::json;

fn png() -> ImportCodexImageInput {
    let mut bytes = std::io::Cursor::new(Vec::new());
    image::DynamicImage::new_rgb8(3, 2)
        .write_to(&mut bytes, image::ImageFormat::Png)
        .unwrap();
    ImportCodexImageInput {
        original_filename: "referência.png".into(),
        data_url: format!(
            "data:image/png;base64,{}",
            STANDARD.encode(bytes.into_inner())
        ),
    }
}

#[test]
fn gallery_migration_preserves_existing_cover_and_gallery_foreign_keys() {
    tauri::async_runtime::block_on(async {
        let directory = tempfile::tempdir().unwrap();
        for entry in std::fs::read_dir("migrations").unwrap() {
            let entry = entry.unwrap();
            if entry.file_name().to_string_lossy().as_ref()
                < "20261025020000_codex_gallery_assets.sql"
            {
                std::fs::copy(entry.path(), directory.path().join(entry.file_name())).unwrap();
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
        let (profile, format, font): (String, String, String) = sqlx::query_as(
            "SELECT p.id,f.id,t.id FROM local_profiles p,book_formats f,font_presets t LIMIT 1",
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        let book = BookService::new(&pool)
            .create_book(
                serde_json::from_value(json!({"profile_id":profile,"format_id":format,
            "font_preset_id":font,"title":"Livro com capa","author_name":"Autora"}))
                .unwrap(),
            )
            .await
            .unwrap();
        let scope = CodexScopeInput {
            profile_id: profile,
            book_id: Some(book.id.clone()),
            universe_id: None,
        };
        let entity = CodexService::new(&pool)
            .create_entity(CreateCodexEntityInput {
                scope: scope.clone(),
                kind: CodexKind::Character,
                name: "Pessoa".into(),
                template_id: None,
            })
            .await
            .unwrap()
            .entity;
        sqlx::query("INSERT INTO image_assets (id,book_id,original_filename,storage_key,mime_type,width_px,height_px,byte_size,sha256,created_at) VALUES ('legacy',?,'capa.png','images/capa.png','image/png',1,1,1,'hash',datetime('now'))")
            .bind(&book.id).execute(&pool).await.unwrap();
        sqlx::query("UPDATE books SET card_image_asset_id='legacy' WHERE id=?")
            .bind(&book.id)
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("INSERT INTO codex_entity_images(id,entity_id,image_asset_id,is_primary,position,created_at,updated_at) VALUES ('legacy-image',?,'legacy',1,0,datetime('now'),datetime('now'))")
            .bind(&entity.id).execute(&pool).await.unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        assert_eq!(
            BookService::new(&pool)
                .get_book_by_id(&book.id)
                .await
                .unwrap()
                .unwrap()
                .card_image_asset_id
                .as_deref(),
            Some("legacy")
        );
        assert_eq!(
            CodexService::new(&pool)
                .get_sheet(scope, &entity.id)
                .await
                .unwrap()
                .images[0]
                .image_asset_id,
            "legacy"
        );
        assert!(sqlx::query("PRAGMA foreign_key_check")
            .fetch_all(&pool)
            .await
            .unwrap()
            .is_empty());
        assert_eq!(
            sqlx::query_scalar::<_, i64>("PRAGMA foreign_keys")
                .fetch_one(&pool)
                .await
                .unwrap(),
            1
        );
        assert!(
            sqlx::query("UPDATE books SET card_image_asset_id='missing' WHERE id=?")
                .bind(&book.id)
                .execute(&pool)
                .await
                .is_err()
        );
    });
}

#[test]
fn gallery_supports_empty_universes_primary_replacement_and_archived_reading() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let storage = tempfile::tempdir().unwrap();
        let service = f.service();
        let entity = service
            .create_entity(CreateCodexEntityInput {
                scope: f.world(),
                kind: CodexKind::Location,
                name: "Cidade".into(),
                template_id: None,
            })
            .await
            .unwrap()
            .entity;
        let first = service
            .import_image(storage.path(), f.world(), &entity.id, png())
            .await
            .unwrap();
        let first_id = first.images[0].id.clone();
        assert!(first.images[0].is_primary);
        assert_eq!(
            first.entity.primary_image_id.as_deref(),
            Some(first_id.as_str())
        );
        let second = service
            .import_image(storage.path(), f.world(), &entity.id, png())
            .await
            .unwrap();
        assert_eq!(second.images.len(), 2);
        let second_id = second.images[1].id.clone();
        let updated = service
            .update_image(
                f.world(),
                &entity.id,
                &second_id,
                UpdateCodexImageInput {
                    caption: "Vista do norte".into(),
                    is_primary: true,
                },
            )
            .await
            .unwrap();
        assert_eq!(
            updated.images.iter().filter(|item| item.is_primary).count(),
            1
        );
        assert_eq!(
            updated.entity.primary_image_id.as_deref(),
            Some(second_id.as_str())
        );
        let asset: (Option<String>, Option<String>, i64, i64, String) = sqlx::query_as(
            "SELECT book_id,codex_entity_id,width_px,height_px,sha256 FROM image_assets WHERE id=?",
        )
        .bind(&second.images[1].image_asset_id)
        .fetch_one(&f.pool)
        .await
        .unwrap();
        assert_eq!(asset.0, None);
        assert_eq!(asset.1, Some(entity.id.clone()));
        assert_eq!((asset.2, asset.3), (3, 2));
        assert_eq!(asset.4.len(), 64);
        assert!(service
            .read_image(storage.path(), f.scope(), &entity.id, &first_id)
            .await
            .is_err());
        let removed = service
            .delete_image(f.world(), &entity.id, &second_id)
            .await
            .unwrap();
        assert_eq!(removed.images.len(), 1);
        assert!(removed.images[0].is_primary);
        UniverseService::new(&f.pool)
            .delete_universe(&f.universe)
            .await
            .unwrap();
        assert!(service
            .read_image(storage.path(), f.world(), &entity.id, &first_id)
            .await
            .unwrap()
            .starts_with("data:image/png;base64,"));
        assert!(service
            .import_image(storage.path(), f.world(), &entity.id, png())
            .await
            .is_err());
        assert!(service
            .delete_image(f.world(), &entity.id, &first_id)
            .await
            .is_err());
    });
}

#[test]
fn failed_gallery_writes_remove_files_and_keep_database_and_primary_unchanged() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let storage = tempfile::tempdir().unwrap();
        let sheet = f.create(CodexKind::Character, "Pessoa").await;
        let invalid = ImportCodexImageInput {
            original_filename: "bad.svg".into(),
            data_url: "data:image/svg+xml;base64,PHN2Zz4=".into(),
        };
        assert!(f
            .service()
            .import_image(storage.path(), f.scope(), &sheet.entity.id, invalid)
            .await
            .is_err());
        sqlx::raw_sql("CREATE TRIGGER reject_codex_image BEFORE INSERT ON codex_entity_images BEGIN SELECT RAISE(ABORT,'injected failure'); END;")
            .execute(&f.pool).await.unwrap();
        assert!(f
            .service()
            .import_image(storage.path(), f.scope(), &sheet.entity.id, png())
            .await
            .is_err());
        assert_eq!(
            sqlx::query_scalar::<_, i64>("SELECT count(*) FROM image_assets")
                .fetch_one(&f.pool)
                .await
                .unwrap(),
            0
        );
        assert_eq!(
            std::fs::read_dir(storage.path().join("images/codex"))
                .unwrap()
                .count(),
            0
        );
        sqlx::raw_sql("DROP TRIGGER reject_codex_image")
            .execute(&f.pool)
            .await
            .unwrap();
        let saved = f
            .service()
            .import_image(storage.path(), f.scope(), &sheet.entity.id, png())
            .await
            .unwrap();
        let id = &saved.images[0].id;
        let two = f
            .service()
            .import_image(storage.path(), f.scope(), &sheet.entity.id, png())
            .await
            .unwrap();
        sqlx::raw_sql("CREATE TRIGGER reject_codex_primary BEFORE UPDATE OF is_primary ON codex_entity_images WHEN NEW.is_primary=1 AND OLD.position=1 BEGIN SELECT RAISE(ABORT,'injected failure'); END;")
            .execute(&f.pool).await.unwrap();
        assert!(f
            .service()
            .update_image(
                f.scope(),
                &sheet.entity.id,
                &two.images[1].id,
                UpdateCodexImageInput {
                    caption: "Não deve persistir".into(),
                    is_primary: true
                }
            )
            .await
            .is_err());
        let unchanged = f
            .service()
            .get_sheet(f.scope(), &sheet.entity.id)
            .await
            .unwrap();
        assert!(unchanged.images[0].is_primary);
        assert!(!unchanged.images[1].is_primary);
        assert_eq!(
            unchanged.images[1].caption.as_deref(),
            Some("referência.png")
        );
        assert!(f
            .service()
            .update_image(
                f.scope(),
                &sheet.entity.id,
                id,
                UpdateCodexImageInput {
                    caption: "x".repeat(1001),
                    is_primary: true
                }
            )
            .await
            .is_err());
        BookService::new(&f.pool)
            .update_book(
                &f.book,
                serde_json::from_value(json!({"universe_id":f.universe})).unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(
            f.service()
                .get_sheet(f.world(), &sheet.entity.id)
                .await
                .unwrap()
                .images[0]
                .id,
            *id
        );
        assert!(f
            .service()
            .read_image(storage.path(), f.world(), &sheet.entity.id, id)
            .await
            .is_ok());
    });
}
