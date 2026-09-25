use crate::domain::review::{ReviewComment, ReviewProgress};
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct ReviewRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ReviewRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn create_comment(
        &self,
        id: &str,
        chapter_id: &str,
        author_profile_id: &str,
        body: &str,
        original_excerpt: &str,
        anchor_json: Option<&str>,
        anchor_revision: i64,
        anchor_state: &str,
    ) -> Result<ReviewComment, AppError> {
        let comment = sqlx::query_as::<_, ReviewComment>(
            r#"
            INSERT INTO review_comments (
                id, chapter_id, author_profile_id, body, original_excerpt,
                anchor_json, anchor_revision, anchor_state, status,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, 'open',
                datetime('now'), datetime('now')
            )
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(chapter_id)
        .bind(author_profile_id)
        .bind(body)
        .bind(original_excerpt)
        .bind(anchor_json)
        .bind(anchor_revision)
        .bind(anchor_state)
        .fetch_one(self.pool)
        .await?;

        Ok(comment)
    }

    pub async fn list_comments_by_chapter(
        &self,
        chapter_id: &str,
    ) -> Result<Vec<ReviewComment>, AppError> {
        let comments = sqlx::query_as::<_, ReviewComment>(
            "SELECT * FROM review_comments WHERE chapter_id = ? ORDER BY created_at ASC",
        )
        .bind(chapter_id)
        .fetch_all(self.pool)
        .await?;

        Ok(comments)
    }

    pub async fn resolve_comment(&self, id: &str) -> Result<ReviewComment, AppError> {
        let comment = sqlx::query_as::<_, ReviewComment>(
            r#"
            UPDATE review_comments
            SET status = 'resolved',
                resolved_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
            RETURNING *
            "#,
        )
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(comment)
    }

    pub async fn reopen_comment(&self, id: &str) -> Result<ReviewComment, AppError> {
        let comment = sqlx::query_as::<_, ReviewComment>(
            r#"
            UPDATE review_comments
            SET status = 'open',
                resolved_at = NULL,
                updated_at = datetime('now')
            WHERE id = ?
            RETURNING *
            "#,
        )
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(comment)
    }

    pub async fn get_progress(&self, chapter_id: &str) -> Result<Option<ReviewProgress>, AppError> {
        let progress = sqlx::query_as::<_, ReviewProgress>(
            "SELECT * FROM review_progress WHERE chapter_id = ?",
        )
        .bind(chapter_id)
        .fetch_optional(self.pool)
        .await?;

        Ok(progress)
    }

    pub async fn save_progress(
        &self,
        chapter_id: &str,
        profile_id: &str,
        anchor_json: Option<&str>,
        anchor_revision: i64,
        reviewed_content_revision: i64,
        needs_recheck: bool,
    ) -> Result<ReviewProgress, AppError> {
        let progress = sqlx::query_as::<_, ReviewProgress>(
            r#"
            INSERT INTO review_progress (
                chapter_id, profile_id, anchor_json, anchor_revision,
                reviewed_content_revision, needs_recheck, marked_at, updated_at
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, datetime('now'), datetime('now')
            )
            ON CONFLICT(chapter_id) DO UPDATE SET
                profile_id = excluded.profile_id,
                anchor_json = excluded.anchor_json,
                anchor_revision = excluded.anchor_revision,
                reviewed_content_revision = excluded.reviewed_content_revision,
                needs_recheck = excluded.needs_recheck,
                updated_at = datetime('now')
            RETURNING *
            "#,
        )
        .bind(chapter_id)
        .bind(profile_id)
        .bind(anchor_json)
        .bind(anchor_revision)
        .bind(reviewed_content_revision)
        .bind(needs_recheck)
        .fetch_one(self.pool)
        .await?;

        Ok(progress)
    }
}
