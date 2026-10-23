use crate::domain::review::{CreateCommentInput, MarkProgressInput, ReviewComment, ReviewProgress};
use crate::error::AppError;
use sqlx::SqliteConnection;

pub struct ReviewRepository;

impl ReviewRepository {
    pub async fn profile_exists(
        connection: &mut SqliteConnection,
        id: &str,
    ) -> Result<bool, AppError> {
        Ok(
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM local_profiles WHERE id = ?)")
                .bind(id)
                .fetch_one(connection)
                .await?,
        )
    }

    pub async fn create_in(
        connection: &mut SqliteConnection,
        id: &str,
        input: &CreateCommentInput,
    ) -> Result<ReviewComment, AppError> {
        Ok(sqlx::query_as::<_, ReviewComment>(
            "INSERT INTO review_comments (id, chapter_id, author_profile_id, body, original_excerpt,
                anchor_json, anchor_revision, anchor_state, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now')) RETURNING *")
            .bind(id).bind(&input.chapter_id).bind(&input.author_profile_id)
            .bind(input.body.trim()).bind(input.original_excerpt.trim()).bind(&input.anchor_json)
            .bind(input.anchor_revision).bind(if input.anchor_json.is_some() { "attached" } else { "removed" })
            .fetch_one(connection).await?)
    }

    pub async fn list_in(
        connection: &mut SqliteConnection,
        chapter_id: &str,
    ) -> Result<Vec<ReviewComment>, AppError> {
        Ok(sqlx::query_as(
            "SELECT * FROM review_comments WHERE chapter_id = ? ORDER BY created_at ASC, id ASC",
        )
        .bind(chapter_id)
        .fetch_all(connection)
        .await?)
    }

    pub async fn find_in(
        connection: &mut SqliteConnection,
        id: &str,
    ) -> Result<ReviewComment, AppError> {
        sqlx::query_as::<_, ReviewComment>("SELECT r.* FROM review_comments r JOIN chapters c ON c.id = r.chapter_id WHERE r.id = ? AND c.deleted_at IS NULL")
            .bind(id).fetch_optional(connection).await?
            .ok_or_else(|| AppError::NotFound("Comentário não encontrado.".into()))
    }

    pub async fn status_in(
        connection: &mut SqliteConnection,
        id: &str,
        status: &str,
    ) -> Result<ReviewComment, AppError> {
        Ok(sqlx::query_as("UPDATE review_comments SET status = ?, resolved_at = CASE WHEN ? = 'resolved' THEN datetime('now') ELSE NULL END, updated_at = datetime('now') WHERE id = ? RETURNING *")
            .bind(status).bind(status).bind(id).fetch_one(connection).await?)
    }

    pub async fn body_in(
        connection: &mut SqliteConnection,
        id: &str,
        body: &str,
    ) -> Result<ReviewComment, AppError> {
        Ok(sqlx::query_as("UPDATE review_comments SET body = ?, updated_at = datetime('now') WHERE id = ? RETURNING *")
            .bind(body).bind(id).fetch_one(connection).await?)
    }

    pub async fn delete_in(connection: &mut SqliteConnection, id: &str) -> Result<(), AppError> {
        sqlx::query("DELETE FROM review_comments WHERE id = ?")
            .bind(id)
            .execute(connection)
            .await?;
        Ok(())
    }

    pub async fn anchor_in(
        connection: &mut SqliteConnection,
        id: &str,
        anchor: Option<&str>,
        revision: i64,
    ) -> Result<(), AppError> {
        sqlx::query("UPDATE review_comments SET anchor_json = ?, anchor_state = ?, anchor_revision = ? WHERE id = ?")
            .bind(anchor).bind(if anchor.is_some() { "attached" } else { "removed" })
            .bind(revision).bind(id).execute(connection).await?;
        Ok(())
    }

    pub async fn progress_in(
        connection: &mut SqliteConnection,
        chapter_id: &str,
    ) -> Result<Option<ReviewProgress>, AppError> {
        Ok(
            sqlx::query_as("SELECT * FROM review_progress WHERE chapter_id = ?")
                .bind(chapter_id)
                .fetch_optional(connection)
                .await?,
        )
    }

    pub async fn save_progress_in(
        connection: &mut SqliteConnection,
        input: &MarkProgressInput,
    ) -> Result<ReviewProgress, AppError> {
        Ok(sqlx::query_as(
            "INSERT INTO review_progress (chapter_id, profile_id, anchor_json, anchor_revision,
                reviewed_content_revision, needs_recheck, marked_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
             ON CONFLICT(chapter_id) DO UPDATE SET profile_id = excluded.profile_id,
                anchor_json = excluded.anchor_json, anchor_revision = excluded.anchor_revision,
                reviewed_content_revision = excluded.reviewed_content_revision,
                needs_recheck = excluded.needs_recheck, marked_at = datetime('now'), updated_at = datetime('now')
             RETURNING *")
            .bind(&input.chapter_id).bind(&input.profile_id).bind(&input.anchor_json)
            .bind(input.anchor_revision).bind(input.reviewed_content_revision).bind(input.needs_recheck)
            .fetch_one(connection).await?)
    }
}
