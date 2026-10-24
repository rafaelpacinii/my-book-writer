use crate::domain::universe::Universe;
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct UniverseRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> UniverseRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_next_position(&self, profile_id: &str) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM universes WHERE profile_id = ? AND deleted_at IS NULL",
        )
        .bind(profile_id)
        .fetch_one(self.pool)
        .await?;

        Ok(row.0)
    }

    pub async fn create(
        &self,
        id: &str,
        profile_id: &str,
        name: &str,
        description: Option<&str>,
        position: i64,
    ) -> Result<Universe, AppError> {
        let universe = sqlx::query_as::<_, Universe>(
            r#"
            INSERT INTO universes (
                id, profile_id, name, description, position, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, datetime('now'), datetime('now')
            )
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(profile_id)
        .bind(name)
        .bind(description)
        .bind(position)
        .fetch_one(self.pool)
        .await?;

        Ok(universe)
    }

    pub async fn list_by_profile(&self, profile_id: &str) -> Result<Vec<Universe>, AppError> {
        let universes = sqlx::query_as::<_, Universe>(
            r#"
            SELECT * FROM universes
            WHERE profile_id = ? AND deleted_at IS NULL
            ORDER BY position ASC, id ASC
            "#,
        )
        .bind(profile_id)
        .fetch_all(self.pool)
        .await?;

        Ok(universes)
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Universe>, AppError> {
        let universe = sqlx::query_as::<_, Universe>(
            "SELECT * FROM universes WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        Ok(universe)
    }

    pub async fn update(
        &self,
        id: &str,
        name: Option<&str>,
        description: Option<Option<&str>>,
    ) -> Result<Universe, AppError> {
        let current = self
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Universo não encontrado".into()))?;

        let next_name = name.unwrap_or(&current.name);
        let next_description = match description {
            Some(desc) => desc,
            None => current.description.as_deref(),
        };

        let updated = sqlx::query_as::<_, Universe>(
            r#"
            UPDATE universes
            SET name = ?,
                description = ?,
                updated_at = datetime('now')
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(next_name)
        .bind(next_description)
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(updated)
    }

    pub async fn reorder(&self, profile_id: &str, universe_ids: &[String]) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;

        for (index, id) in universe_ids.iter().enumerate() {
            sqlx::query(
                r#"
                UPDATE universes
                SET position = ?, updated_at = datetime('now')
                WHERE id = ? AND profile_id = ? AND deleted_at IS NULL
                "#,
            )
            .bind(index as i64)
            .bind(id)
            .bind(profile_id)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn soft_delete(&self, id: &str) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;

        sqlx::query(
            "UPDATE universes SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            "UPDATE book_series SET universe_id = NULL, updated_at = datetime('now') WHERE universe_id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            "UPDATE books SET universe_id = NULL, updated_at = datetime('now') WHERE universe_id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(())
    }
}

