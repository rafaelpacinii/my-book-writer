use crate::domain::chapter::Chapter;
use crate::domain::chapter_version::{ChapterVersion, ChapterVersionSummary};
use crate::error::AppError;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct ChapterVersionRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ChapterVersionRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Cria um novo snapshot de versão histórica para um capítulo
    pub async fn create_version(
        &self,
        chapter: &Chapter,
        description: Option<&str>,
        word_count: i64,
    ) -> Result<ChapterVersion, AppError> {
        let mut tx = self.pool.begin().await?;

        // Determina o próximo version_number
        let next_number: i64 = sqlx::query_scalar(
            r#"
            SELECT COALESCE(MAX(version_number), 0) + 1
            FROM chapter_versions
            WHERE chapter_id = ?
            "#,
        )
        .bind(&chapter.id)
        .fetch_one(&mut *tx)
        .await?;

        let id = Uuid::now_v7().to_string();

        let version = sqlx::query_as::<_, ChapterVersion>(
            r#"
            INSERT INTO chapter_versions (
                id, chapter_id, version_number, title, content_json, description, word_count, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(&chapter.id)
        .bind(next_number)
        .bind(&chapter.title)
        .bind(&chapter.content_json)
        .bind(description)
        .bind(word_count)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(version)
    }

    /// Lista os resumos das versões de um capítulo ordenadas da mais recente para a mais antiga
    pub async fn list_by_chapter(
        &self,
        chapter_id: &str,
    ) -> Result<Vec<ChapterVersionSummary>, AppError> {
        let versions = sqlx::query_as::<_, ChapterVersionSummary>(
            r#"
            SELECT id, chapter_id, version_number, title, description, word_count, created_at
            FROM chapter_versions
            WHERE chapter_id = ?
            ORDER BY version_number DESC
            "#,
        )
        .bind(chapter_id)
        .fetch_all(self.pool)
        .await?;

        Ok(versions)
    }

    /// Busca uma versão completa pelo ID
    pub async fn find_by_id(&self, id: &str) -> Result<Option<ChapterVersion>, AppError> {
        let version = sqlx::query_as::<_, ChapterVersion>(
            r#"
            SELECT id, chapter_id, version_number, title, content_json, description, word_count, created_at
            FROM chapter_versions
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        Ok(version)
    }

    /// Exclui uma versão específica do histórico
    pub async fn delete_version(&self, id: &str) -> Result<bool, AppError> {
        let res = sqlx::query("DELETE FROM chapter_versions WHERE id = ?")
            .bind(id)
            .execute(self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    /// Atualiza o flag track_changes_enabled do capítulo
    pub async fn set_track_changes(
        &self,
        chapter_id: &str,
        enabled: bool,
    ) -> Result<Chapter, AppError> {
        let chapter = sqlx::query_as::<_, Chapter>(
            r#"
            UPDATE chapters
            SET track_changes_enabled = ?, updated_at = datetime('now')
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(enabled)
        .bind(chapter_id)
        .fetch_one(self.pool)
        .await?;

        Ok(chapter)
    }
}
