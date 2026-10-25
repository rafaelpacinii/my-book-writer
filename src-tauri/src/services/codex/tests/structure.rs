use super::*;
use serde_json::json;

#[test]
fn structure_reorders_moves_and_soft_deletes_without_changing_ids() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let sheet = f.create(CodexKind::Character, "Pessoa").await;
        let mut categories = structure(&sheet);
        let moved = categories[0].fields.remove(0);
        let moved_id = moved.id.clone().unwrap();
        categories[1].fields.insert(0, moved);
        let removed = categories.pop().unwrap();
        categories.reverse();
        let saved = f
            .service()
            .save_structure(f.scope(), &sheet.entity.id, categories.clone())
            .await
            .unwrap();
        assert_eq!(saved.categories[0].id, categories[0].id.clone().unwrap());
        assert_eq!(
            saved
                .fields
                .iter()
                .find(|v| v.id == moved_id)
                .unwrap()
                .category_id,
            categories[categories.len() - 2].id.clone().unwrap()
        );
        assert!(!saved
            .categories
            .iter()
            .any(|v| Some(&v.id) == removed.id.as_ref()));
        let deleted: Option<String> =
            sqlx::query_scalar("SELECT deleted_at FROM codex_categories WHERE id=?")
                .bind(removed.id)
                .fetch_one(&f.pool)
                .await
                .unwrap();
        assert!(deleted.is_some());
    });
}

#[test]
fn invalid_structure_and_database_failures_leave_the_previous_sheet_untouched() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let sheet = f.create(CodexKind::Character, "Pessoa").await;
        let foreign = f.create(CodexKind::Character, "Outra").await;
        let before = serde_json::to_value(&sheet).unwrap();
        for case in 0..4 {
            let mut categories = structure(&sheet);
            match case {
                0 => categories[0].id = Some(foreign.categories[0].id.clone()),
                1 => categories[0].fields[0].id = Some(foreign.fields[0].id.clone()),
                2 => {
                    categories[0].fields[0].field_type = CodexFieldType::Scale;
                    categories[0].fields[0].value = json!(101);
                }
                _ => categories.push(categories[0].clone()),
            }
            assert!(f
                .service()
                .save_structure(f.scope(), &sheet.entity.id, categories)
                .await
                .is_err());
            assert_eq!(
                serde_json::to_value(
                    f.service()
                        .get_sheet(f.scope(), &sheet.entity.id)
                        .await
                        .unwrap()
                )
                .unwrap(),
                before
            );
        }
        sqlx::raw_sql("CREATE TRIGGER fail_codex_field BEFORE INSERT ON codex_fields BEGIN SELECT RAISE(ABORT,'injected failure'); END;")
            .execute(&f.pool).await.unwrap();
        let mut categories = structure(&sheet);
        categories[0].name = "Não deve persistir".into();
        categories[0].fields[0].id = None;
        assert!(f
            .service()
            .save_structure(f.scope(), &sheet.entity.id, categories)
            .await
            .is_err());
        assert_eq!(
            serde_json::to_value(
                f.service()
                    .get_sheet(f.scope(), &sheet.entity.id)
                    .await
                    .unwrap()
            )
            .unwrap(),
            before
        );
    });
}

#[test]
fn reference_fields_are_restricted_to_the_effective_scope() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let sheet = f.create(CodexKind::Character, "Pessoa").await;
        let other = f
            .service()
            .create_entity(CreateCodexEntityInput {
                scope: CodexScopeInput {
                    book_id: Some(f.other_book.clone()),
                    ..f.scope()
                },
                name: "Cidade de outro livro".into(),
                kind: CodexKind::Location,
                template_id: None,
            })
            .await
            .unwrap();
        let mut categories = structure(&sheet);
        categories[0].fields[0].field_type = CodexFieldType::Reference;
        categories[0].fields[0].value = json!([other.entity.id]);
        assert!(f
            .service()
            .save_structure(f.scope(), &sheet.entity.id, categories.clone())
            .await
            .is_err());
        categories[0].fields[0].value = json!([sheet.entity.id]);
        assert!(f
            .service()
            .save_structure(f.scope(), &sheet.entity.id, categories)
            .await
            .is_ok());
    });
}
