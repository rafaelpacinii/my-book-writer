use super::CodexRepository;
use crate::domain::codex::*;
use crate::error::AppError;
use sqlx::SqliteConnection;

impl CodexRepository {
    pub async fn category_owner(
        conn: &mut SqliteConnection,
        id: &str,
    ) -> Result<Option<String>, AppError> {
        Ok(
            sqlx::query_scalar("SELECT entity_id FROM codex_categories WHERE id=?")
                .bind(id)
                .fetch_optional(conn)
                .await?,
        )
    }
    pub async fn field_owner(
        conn: &mut SqliteConnection,
        id: &str,
    ) -> Result<Option<String>, AppError> {
        Ok(sqlx::query_scalar("SELECT c.entity_id FROM codex_fields f JOIN codex_categories c ON c.id=f.category_id WHERE f.id=?")
            .bind(id).fetch_optional(conn).await?)
    }
    pub async fn replace_structure(
        conn: &mut SqliteConnection,
        entity: &str,
        categories: &[CodexCategoryInput],
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE codex_fields SET deleted_at=datetime('now'),updated_at=datetime('now')
            WHERE category_id IN (SELECT id FROM codex_categories WHERE entity_id=?)",
        )
        .bind(entity)
        .execute(&mut *conn)
        .await?;
        sqlx::query("UPDATE codex_categories SET deleted_at=datetime('now'),updated_at=datetime('now') WHERE entity_id=?")
            .bind(entity).execute(&mut *conn).await?;
        for (position, category) in categories.iter().enumerate() {
            sqlx::query("INSERT INTO codex_categories (id,entity_id,name,position,created_at,updated_at)
                VALUES (?,?,?,?,datetime('now'),datetime('now')) ON CONFLICT(id) DO UPDATE
                SET name=excluded.name,position=excluded.position,updated_at=datetime('now'),deleted_at=NULL")
                .bind(&category.id).bind(entity).bind(&category.name).bind(position as i64).execute(&mut *conn).await?;
            for (index, field) in category.fields.iter().enumerate() {
                sqlx::query("INSERT INTO codex_fields (id,category_id,label,field_type,value_json,config_json,position,created_at,updated_at)
                    VALUES (?,?,?,?,?,?,?,datetime('now'),datetime('now')) ON CONFLICT(id) DO UPDATE SET
                    category_id=excluded.category_id,label=excluded.label,field_type=excluded.field_type,value_json=excluded.value_json,
                    config_json=excluded.config_json,position=excluded.position,updated_at=datetime('now'),deleted_at=NULL")
                    .bind(&field.id).bind(&category.id).bind(&field.label).bind(field.field_type.as_str())
                    .bind(field.value.to_string()).bind(field.config.to_string()).bind(index as i64).execute(&mut *conn).await?;
            }
        }
        sqlx::query("UPDATE codex_entities SET updated_at=datetime('now') WHERE id=?")
            .bind(entity)
            .execute(conn)
            .await?;
        Ok(())
    }
}
