use crate::domain::chapter::{Chapter, ChapterSummary};
use crate::error::AppError;
use crate::repositories::book_repository::touch_book;
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
        let mut tx = self.pool.begin().await?;
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
        .fetch_one(&mut *tx)
        .await?;

        touch_book(&mut *tx, book_id).await?;
        tx.commit().await?;
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
        let mut tx = self.pool.begin().await?;
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
        .fetch_one(&mut *tx)
        .await?;

        touch_book(&mut *tx, &chapter.book_id).await?;
        tx.commit().await?;
        Ok(chapter)
    }

    /// Salva o conteúdo atulizando a revisão apenas se a revisão esperada coincidir
    pub async fn save_content(
        &self,
        id: &str,
        expected_revision: i64,
        content_json: &str,
    ) -> Result<Option<Chapter>, AppError> {
        let mut tx = self.pool.begin().await?;
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
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(saved) = &chapter {
            touch_book(&mut *tx, &saved.book_id).await?;
        }
        tx.commit().await?;
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

        touch_book(&mut *tx, book_id).await?;
        tx.commit().await?;
        Ok(())
    }

    pub async fn soft_delete(&self, id: &str) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;
        let deleted: Option<(String,)> = sqlx::query_as(
            "UPDATE chapters SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL RETURNING book_id",
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?;

        if let Some((book_id,)) = deleted {
            touch_book(&mut *tx, &book_id).await?;
        }
        tx.commit().await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;

    const OLD: &str = "2000-01-01 00:00:00";

    async fn setup() -> SqlitePool {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        sqlx::query(
            r#"INSERT INTO books (id, profile_id, format_id, font_preset_id, title, author_name,
                position, font_size_pt, line_height_ratio, margin_top_um, margin_bottom_um,
                margin_left_um, margin_right_um, created_at, updated_at)
            VALUES ('b1', (SELECT id FROM local_profiles LIMIT 1),
                (SELECT id FROM book_formats LIMIT 1), (SELECT id FROM font_presets LIMIT 1),
                'Livro', 'Autor', 0, 11, 1.4, 20000, 20000, 20000, 20000, ?, ?)"#,
        )
        .bind(OLD)
        .bind(OLD)
        .execute(&pool)
        .await
        .unwrap();
        pool
    }

    async fn book_touched(pool: &SqlitePool) -> bool {
        let row: (String,) = sqlx::query_as("SELECT updated_at FROM books WHERE id = 'b1'")
            .fetch_one(pool)
            .await
            .unwrap();
        let touched = row.0 != OLD;
        sqlx::query("UPDATE books SET updated_at = ? WHERE id = 'b1'")
            .bind(OLD)
            .execute(pool)
            .await
            .unwrap();
        touched
    }

    #[test]
    fn chapter_changes_update_book_timestamp() {
        tauri::async_runtime::block_on(async {
            let pool = setup().await;
            let repo = ChapterRepository::new(&pool);

            repo.create("c1", "b1", "Um", 0, "{}").await.unwrap();
            assert!(book_touched(&pool).await, "create");

            repo.update_title("c1", "Novo").await.unwrap();
            assert!(book_touched(&pool).await, "rename");

            repo.save_content("c1", 0, "{}").await.unwrap().unwrap();
            assert!(book_touched(&pool).await, "save");

            assert!(repo.save_content("c1", 99, "{}").await.unwrap().is_none());
            assert!(!book_touched(&pool).await, "conflict must not touch");

            repo.reorder("b1", &["c1".to_string()]).await.unwrap();
            assert!(book_touched(&pool).await, "reorder");

            repo.soft_delete("c1").await.unwrap();
            assert!(book_touched(&pool).await, "delete");
        });
    }
}
