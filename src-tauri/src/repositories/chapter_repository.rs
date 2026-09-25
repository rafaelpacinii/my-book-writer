use crate::domain::chapter::{Chapter, ChapterSummary};
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct ChapterRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ChapterRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_next_position(&self, book_id: &str) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM chapters WHERE book_id = ? AND deleted_at IS NULL"
        )
        .bind(book_id)
        .fetch_one(self.pool)
        .await?;

        Ok(row.0)
    }

    pub async fn create(
        &self,
        id: &str,
        book_id: &str,
        title: &str,
        position: i64,
        content_json: &str,
    ) -> Result<Chapter, AppError> {
        let chapter = sqlx::query_as::<_, Chapter>(
            r#"
            INSERT INTO chapters (
                id, book_id, title, position, content_json,
                content_schema_version, content_revision, track_changes_enabled,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                1, 0, 0,
                datetime('now'), datetime('now')
            )
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(book_id)
        .bind(title)
        .bind(position)
        .bind(content_json)
        .fetch_one(self.pool)
        .await?;

        Ok(chapter)
    }

    pub async fn list_by_book(&self, book_id: &str) -> Result<Vec<ChapterSummary>, AppError> {
        let chapters = sqlx::query_as::<_, ChapterSummary>(
            r#"
            SELECT id, book_id, title, position, content_revision, track_changes_enabled, created_at, updated_at
            FROM chapters
            WHERE book_id = ? AND deleted_at IS NULL
            ORDER BY position ASC, id ASC
            "#
        )
        .bind(book_id)
        .fetch_all(self.pool)
        .await?;

        Ok(chapters)
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Chapter>, AppError> {
        let chapter = sqlx::query_as::<_, Chapter>(
            "SELECT * FROM chapters WHERE id = ? AND deleted_at IS NULL",
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        Ok(chapter)
    }

    pub async fn update_title(&self, id: &str, title: &str) -> Result<Chapter, AppError> {
        let chapter = sqlx::query_as::<_, Chapter>(
            r#"
            UPDATE chapters
            SET title = ?, updated_at = datetime('now')
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(title)
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(chapter)
    }

    /// Salva o conteúdo atulizando a revisão apenas se a revisão esperada coincidir
    pub async fn save_content(
        &self,
        id: &str,
        expected_revision: i64,
        content_json: &str,
    ) -> Result<Option<Chapter>, AppError> {
        let chapter = sqlx::query_as::<_, Chapter>(
            r#"
            UPDATE chapters
            SET content_json = ?,
                content_revision = content_revision + 1,
                updated_at = datetime('now')
            WHERE id = ? AND content_revision = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(content_json)
        .bind(id)
        .bind(expected_revision)
        .fetch_optional(self.pool)
        .await?;

        Ok(chapter)
    }

    /// Reordena em uma transação atômica do SQLite
    pub async fn reorder(&self, book_id: &str, chapter_ids: &[String]) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;

        for (index, id) in chapter_ids.iter().enumerate() {
            sqlx::query(
                r#"
                UPDATE chapters
                SET position = ?, updated_at = datetime('now')
                WHERE id = ? AND book_id = ? AND deleted_at IS NULL
                "#,
            )
            .bind(index as i64)
            .bind(id)
            .bind(book_id)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn soft_delete(&self, id: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE chapters SET deleted_at = datetime('now') WHERE id = ?")
            .bind(id)
            .execute(self.pool)
            .await?;

        Ok(())
    }
}
