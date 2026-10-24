use crate::domain::book::Book;
use crate::domain::series::BookSeries;
use crate::error::AppError;
use sqlx::{SqliteConnection, SqlitePool};
use std::collections::HashSet;

/// Renumera sequencialmente (1..N) os volumes ativos de uma série para evitar lacunas.
pub async fn compact_series_volumes(
    conn: &mut SqliteConnection,
    series_id: &str,
) -> Result<(), AppError> {
    let book_ids: Vec<(String,)> = sqlx::query_as(
        r#"
        SELECT id FROM books
        WHERE series_id = ? AND deleted_at IS NULL
        ORDER BY COALESCE(series_volume, 999999) ASC, position ASC, id ASC
        "#,
    )
    .bind(series_id)
    .fetch_all(&mut *conn)
    .await?;

    for (idx, (book_id,)) in book_ids.iter().enumerate() {
        let volume = (idx as i64) + 1;
        sqlx::query("UPDATE books SET series_volume = ? WHERE id = ?")
            .bind(volume)
            .bind(book_id)
            .execute(&mut *conn)
            .await?;
    }

    Ok(())
}

/// Calcula o próximo número de volume (1-based) dentro de uma série.
pub async fn next_series_volume(
    conn: &mut SqliteConnection,
    series_id: &str,
) -> Result<i64, AppError> {
    let row: (i64,) = sqlx::query_as(
        "SELECT COALESCE(MAX(series_volume), 0) + 1 FROM books WHERE series_id = ? AND deleted_at IS NULL",
    )
    .bind(series_id)
    .fetch_one(&mut *conn)
    .await?;

    Ok(row.0)
}

pub struct SeriesRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> SeriesRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_next_position(&self, profile_id: &str) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM book_series WHERE profile_id = ? AND deleted_at IS NULL",
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
        universe_id: Option<&str>,
        name: &str,
        description: Option<&str>,
        position: i64,
    ) -> Result<BookSeries, AppError> {
        let series = sqlx::query_as::<_, BookSeries>(
            r#"
            INSERT INTO book_series (
                id, profile_id, universe_id, name, description, position, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
            )
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(profile_id)
        .bind(universe_id)
        .bind(name)
        .bind(description)
        .bind(position)
        .fetch_one(self.pool)
        .await?;

        Ok(series)
    }

    pub async fn list_by_profile(&self, profile_id: &str) -> Result<Vec<BookSeries>, AppError> {
        let list = sqlx::query_as::<_, BookSeries>(
            r#"
            SELECT * FROM book_series
            WHERE profile_id = ? AND deleted_at IS NULL
            ORDER BY position ASC, id ASC
            "#,
        )
        .bind(profile_id)
        .fetch_all(self.pool)
        .await?;

        Ok(list)
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<BookSeries>, AppError> {
        let series = sqlx::query_as::<_, BookSeries>(
            "SELECT * FROM book_series WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        Ok(series)
    }

    pub async fn update(
        &self,
        id: &str,
        name: Option<&str>,
        description: Option<Option<&str>>,
        universe_id: Option<Option<&str>>,
    ) -> Result<BookSeries, AppError> {
        let mut tx = self.pool.begin().await?;

        let current = sqlx::query_as::<_, BookSeries>(
            "SELECT * FROM book_series WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Série não encontrada".into()))?;

        let next_name = name.unwrap_or(&current.name);
        let next_description = match description {
            Some(desc) => desc,
            None => current.description.as_deref(),
        };
        let next_universe = match universe_id {
            Some(u) => u,
            None => current.universe_id.as_deref(),
        };

        let updated = sqlx::query_as::<_, BookSeries>(
            r#"
            UPDATE book_series
            SET name = ?,
                description = ?,
                universe_id = ?,
                updated_at = datetime('now')
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(next_name)
        .bind(next_description)
        .bind(next_universe)
        .bind(id)
        .fetch_one(&mut *tx)
        .await?;

        if let Some(uid) = universe_id {
            sqlx::query(
                "UPDATE books SET universe_id = ?, updated_at = datetime('now') WHERE series_id = ? AND deleted_at IS NULL",
            )
            .bind(uid)
            .bind(id)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(updated)
    }

    pub async fn reorder_series(
        &self,
        profile_id: &str,
        series_ids: &[String],
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;

        for (index, id) in series_ids.iter().enumerate() {
            sqlx::query(
                r#"
                UPDATE book_series
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

    /// Reordena os livros dentro de uma série, atribuindo volumes automáticos de 1 a N.
    pub async fn reorder_books(
        &self,
        series_id: &str,
        book_ids: &[String],
    ) -> Result<Vec<Book>, AppError> {
        let mut tx = self.pool.begin().await?;

        let existing_rows: Vec<(String,)> = sqlx::query_as(
            r#"
            SELECT id FROM books
            WHERE series_id = ? AND deleted_at IS NULL
            ORDER BY COALESCE(series_volume, 999999) ASC, position ASC, id ASC
            "#,
        )
        .bind(series_id)
        .fetch_all(&mut *tx)
        .await?;

        let existing_set: HashSet<String> = existing_rows.iter().map(|r| r.0.clone()).collect();
        let mut final_order: Vec<String> = Vec::with_capacity(existing_rows.len());
        let mut seen = HashSet::new();

        for req_id in book_ids {
            if existing_set.contains(req_id) && seen.insert(req_id.clone()) {
                final_order.push(req_id.clone());
            }
        }
        for (existing_id,) in existing_rows {
            if seen.insert(existing_id.clone()) {
                final_order.push(existing_id);
            }
        }

        for (index, book_id) in final_order.iter().enumerate() {
            let volume = (index as i64) + 1;
            sqlx::query(
                r#"
                UPDATE books
                SET series_volume = ?, updated_at = datetime('now')
                WHERE id = ? AND series_id = ? AND deleted_at IS NULL
                "#,
            )
            .bind(volume)
            .bind(book_id)
            .bind(series_id)
            .execute(&mut *tx)
            .await?;
        }

        sqlx::query(
            "UPDATE book_series SET updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(series_id)
        .execute(&mut *tx)
        .await?;

        let books = sqlx::query_as::<_, Book>(
            r#"
            SELECT * FROM books
            WHERE series_id = ? AND deleted_at IS NULL
            ORDER BY series_volume ASC, position ASC, id ASC
            "#,
        )
        .bind(series_id)
        .fetch_all(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(books)
    }

    pub async fn soft_delete(&self, id: &str) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;

        sqlx::query(
            "UPDATE book_series SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            "UPDATE books SET series_id = NULL, series_volume = NULL, updated_at = datetime('now') WHERE series_id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(())
    }
}
