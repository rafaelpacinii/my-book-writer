use super::*;
use serde_json::json;

#[test]
fn presets_crud_and_templates_are_persisted_without_copying_personal_values() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let service = f.service();
        let first = service.list_templates(&f.profile, None).await.unwrap();
        assert_eq!(first.len(), 3);
        assert_eq!(
            service
                .list_templates(&f.profile, None)
                .await
                .unwrap()
                .iter()
                .map(|t| &t.id)
                .collect::<Vec<_>>(),
            first.iter().map(|t| &t.id).collect::<Vec<_>>()
        );
        for kind in [CodexKind::Character, CodexKind::Location, CodexKind::Lore] {
            let sheet = f.create(kind, "  Nome da ficha  ").await;
            assert_eq!(sheet.entity.name, "Nome da ficha");
            assert!(!sheet.categories.is_empty());
            assert!(!sheet.fields.is_empty());
            assert_eq!(
                uuid::Uuid::parse_str(&sheet.entity.id)
                    .unwrap()
                    .get_version_num(),
                7
            );
        }
        let sheet = f.create(CodexKind::Character, "Heroína").await;
        let updated = service.update_entity(f.scope(), &sheet.entity.id, serde_json::from_value(json!({
            "summary":"Resumo","role":"Protagonista","status":"Viva","archetype":"Viajante","tags":[" coragem ","coragem"]
        })).unwrap()).await.unwrap();
        assert_eq!(updated.tags_json, "[\"coragem\"]");
        assert_eq!(updated.role.as_deref(), Some("Protagonista"));
        let mut categories = structure(&sheet);
        categories[0].fields[0].value = json!("Texto privado da heroína");
        service
            .save_structure(f.scope(), &sheet.entity.id, categories)
            .await
            .unwrap();
        let template = service
            .save_template(f.scope(), &sheet.entity.id, "Meu modelo")
            .await
            .unwrap();
        assert!(!template.schema_json.contains("Texto privado"));
        assert!(!template.schema_json.contains(&sheet.fields[0].id));
        let copied = service
            .create_entity(CreateCodexEntityInput {
                scope: f.scope(),
                kind: CodexKind::Character,
                name: "Outra pessoa".into(),
                template_id: Some(template.id.clone()),
            })
            .await
            .unwrap();
        assert_eq!(copied.fields.len(), sheet.fields.len());
        assert_ne!(copied.fields[0].id, sheet.fields[0].id);
        service
            .delete_entity(f.scope(), &sheet.entity.id)
            .await
            .unwrap();
        assert!(service
            .get_sheet(f.scope(), &sheet.entity.id)
            .await
            .is_err());
        let retained: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM codex_fields WHERE category_id IN (SELECT id FROM codex_categories WHERE entity_id=?)")
            .bind(&sheet.entity.id).fetch_one(&f.pool).await.unwrap();
        assert_eq!(retained as usize, sheet.fields.len());
        service
            .delete_template(&f.profile, &template.id)
            .await
            .unwrap();
        assert_eq!(
            service
                .list_templates(&f.profile, None)
                .await
                .unwrap()
                .len(),
            3
        );
        assert!(service
            .delete_template(&f.profile, &first[0].id)
            .await
            .is_err());
    });
}
