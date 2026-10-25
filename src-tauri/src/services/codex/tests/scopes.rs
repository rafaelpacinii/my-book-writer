use super::*;
use crate::services::{
    book_service::BookService, series_service::SeriesService, universe_service::UniverseService,
};
use serde_json::json;

#[test]
fn book_and_series_promote_codex_atomically_and_archived_worlds_remain_readable() {
    tauri::async_runtime::block_on(async {
        for through_series in [false, true] {
            let f = fixture().await;
            let entity = f.create(CodexKind::Character, "Personagem local").await;
            if through_series {
                let series = SeriesService::new(&f.pool)
                    .create_series(
                        serde_json::from_value(json!({"profile_id":f.profile,"name":"Saga"}))
                            .unwrap(),
                    )
                    .await
                    .unwrap();
                BookService::new(&f.pool)
                    .update_book(
                        &f.book,
                        serde_json::from_value(json!({"series_id":series.id})).unwrap(),
                    )
                    .await
                    .unwrap();
                SeriesService::new(&f.pool)
                    .update_series(
                        &series.id,
                        serde_json::from_value(json!({"universe_id":f.universe})).unwrap(),
                    )
                    .await
                    .unwrap();
            } else {
                BookService::new(&f.pool)
                    .update_book(
                        &f.book,
                        serde_json::from_value(json!({"universe_id":f.universe})).unwrap(),
                    )
                    .await
                    .unwrap();
            }
            let stored: (Option<String>, Option<String>) =
                sqlx::query_as("SELECT book_id,universe_id FROM codex_entities WHERE id=?")
                    .bind(&entity.entity.id)
                    .fetch_one(&f.pool)
                    .await
                    .unwrap();
            assert_eq!(stored, (None, Some(f.universe.clone())));
            BookService::new(&f.pool)
                .update_book(
                    &f.other_book,
                    serde_json::from_value(json!({"universe_id":f.universe})).unwrap(),
                )
                .await
                .unwrap();
            let shared = f
                .service()
                .get_sheet(
                    CodexScopeInput {
                        book_id: Some(f.other_book.clone()),
                        ..f.scope()
                    },
                    &entity.entity.id,
                )
                .await
                .unwrap();
            assert_eq!(
                shared.fields.iter().map(|v| &v.id).collect::<Vec<_>>(),
                entity.fields.iter().map(|v| &v.id).collect::<Vec<_>>()
            );
            UniverseService::new(&f.pool)
                .delete_universe(&f.universe)
                .await
                .unwrap();
            let archive = f
                .service()
                .get_sheet(f.world(), &entity.entity.id)
                .await
                .unwrap();
            assert_eq!(archive.entity.id, entity.entity.id);
            assert!(f
                .service()
                .list_scopes(&f.profile)
                .await
                .unwrap()
                .iter()
                .any(|context| context.id == f.universe && context.is_archived));
            assert!(f
                .service()
                .update_entity(
                    f.world(),
                    &entity.entity.id,
                    UpdateCodexEntityInput::default()
                )
                .await
                .is_err());
        }
    });
}

#[test]
fn scopes_and_templates_cannot_cross_books_universes_or_profiles() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let sheet = f.create(CodexKind::Location, "Cidade").await;
        let other = CodexScopeInput {
            book_id: Some(f.other_book.clone()),
            ..f.scope()
        };
        assert!(f
            .service()
            .get_sheet(other, &sheet.entity.id)
            .await
            .is_err());
        assert!(f
            .service()
            .get_sheet(f.world(), &sheet.entity.id)
            .await
            .is_err());
        sqlx::query("INSERT INTO local_profiles VALUES ('another','Outro perfil',datetime('now'),datetime('now'))").execute(&f.pool).await.unwrap();
        assert!(f
            .service()
            .resolve_scope(CodexScopeInput {
                profile_id: "another".into(),
                ..f.scope()
            })
            .await
            .is_err());
        assert!(f
            .service()
            .resolve_scope(CodexScopeInput {
                universe_id: Some(f.universe.clone()),
                ..f.scope()
            })
            .await
            .is_err());
        let templates = f.service().list_templates("another", None).await.unwrap();
        assert_eq!(templates.len(), 3);
        assert!(f
            .service()
            .create_entity(CreateCodexEntityInput {
                scope: f.scope(),
                kind: CodexKind::Location,
                name: "Modelo de outro perfil".into(),
                template_id: Some(templates[0].id.clone())
            })
            .await
            .is_err());
        let original = f
            .service()
            .list_templates(&f.profile, Some(CodexKind::Character))
            .await
            .unwrap();
        assert!(f
            .service()
            .create_entity(CreateCodexEntityInput {
                scope: f.scope(),
                kind: CodexKind::Location,
                name: "Tipo incorreto".into(),
                template_id: Some(original[0].id.clone())
            })
            .await
            .is_err());
    });
}
