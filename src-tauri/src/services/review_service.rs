use crate::domain::chapter::Chapter;
use crate::domain::review::{CreateCommentInput, MarkProgressInput, ReviewComment, ReviewProgress};
use crate::error::AppError;
use crate::repositories::chapter_repository::ChapterRepository;
use crate::repositories::review_repository::ReviewRepository as Repo;
use crate::services::review_anchor;
use sqlx::{SqliteConnection, SqlitePool};
use uuid::Uuid;

pub struct ReviewService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ReviewService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    async fn chapter(connection: &mut SqliteConnection, id: &str) -> Result<Chapter, AppError> {
        ChapterRepository::find_in(connection, id)
            .await?
            .ok_or_else(|| AppError::NotFound("Capítulo não encontrado.".into()))
    }

    async fn profile(connection: &mut SqliteConnection, id: &str) -> Result<(), AppError> {
        if !Repo::profile_exists(connection, id).await? {
            return Err(AppError::Validation("Perfil não encontrado.".into()));
        }
        Ok(())
    }

    fn check_revision(chapter: &Chapter, revision: i64) -> Result<(), AppError> {
        if revision != chapter.content_revision {
            return Err(AppError::Validation(
                "O capítulo mudou. Atualize a revisão antes de continuar.".into(),
            ));
        }
        Ok(())
    }

    pub async fn create_comment(
        &self,
        input: CreateCommentInput,
    ) -> Result<ReviewComment, AppError> {
        if input.body.trim().is_empty() {
            return Err(AppError::Validation(
                "O comentário não pode ser vazio".into(),
            ));
        }
        if input.original_excerpt.trim().is_empty() {
            return Err(AppError::Validation(
                "O trecho selecionado não pode ser vazio".into(),
            ));
        }
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter = Self::chapter(&mut tx, &input.chapter_id).await?;
        Self::profile(&mut tx, &input.author_profile_id).await?;
        Self::check_revision(&chapter, input.anchor_revision)?;
        if let Some(json) = &input.anchor_json {
            if !review_anchor::valid_for(
                json,
                &review_anchor::chapter_text(&chapter.content_json),
                input.original_excerpt.trim(),
            ) {
                return Err(AppError::Validation(
                    "O trecho selecionado mudou. Selecione-o novamente.".into(),
                ));
            }
        }
        let comment = Repo::create_in(&mut tx, &Uuid::now_v7().to_string(), &input).await?;
        tx.commit().await?;
        Ok(comment)
    }

    pub async fn reconcile_in(
        connection: &mut SqliteConnection,
        chapter: &Chapter,
    ) -> Result<(), AppError> {
        let text = review_anchor::chapter_text(&chapter.content_json);
        for comment in Repo::list_in(connection, &chapter.id).await? {
            let anchor = review_anchor::reconcile(
                comment.anchor_json.as_deref(),
                &comment.original_excerpt,
                &text,
            );
            if anchor != comment.anchor_json || comment.anchor_revision != chapter.content_revision
            {
                Repo::anchor_in(
                    connection,
                    &comment.id,
                    anchor.as_deref(),
                    chapter.content_revision,
                )
                .await?;
            }
        }
        Ok(())
    }

    pub async fn list_comments(&self, chapter_id: &str) -> Result<Vec<ReviewComment>, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter = Self::chapter(&mut tx, chapter_id).await?;
        Self::reconcile_in(&mut tx, &chapter).await?;
        let comments = Repo::list_in(&mut tx, chapter_id).await?;
        tx.commit().await?;
        Ok(comments)
    }

    async fn change_status(&self, id: &str, status: &str) -> Result<ReviewComment, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        Repo::find_in(&mut tx, id).await?;
        let comment = Repo::status_in(&mut tx, id, status).await?;
        tx.commit().await?;
        Ok(comment)
    }

    pub async fn resolve_comment(&self, id: &str) -> Result<ReviewComment, AppError> {
        self.change_status(id, "resolved").await
    }
    pub async fn reopen_comment(&self, id: &str) -> Result<ReviewComment, AppError> {
        self.change_status(id, "open").await
    }

    pub async fn update_comment(&self, id: &str, body: &str) -> Result<ReviewComment, AppError> {
        if body.trim().is_empty() {
            return Err(AppError::Validation(
                "O comentário não pode ser vazio".into(),
            ));
        }
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        Repo::find_in(&mut tx, id).await?;
        let comment = Repo::body_in(&mut tx, id, body.trim()).await?;
        tx.commit().await?;
        Ok(comment)
    }

    pub async fn delete_comment(&self, id: &str) -> Result<(), AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        Repo::find_in(&mut tx, id).await?;
        Repo::delete_in(&mut tx, id).await?;
        tx.commit().await?;
        Ok(())
    }

    pub async fn get_progress(&self, chapter_id: &str) -> Result<Option<ReviewProgress>, AppError> {
        let mut connection = self.pool.acquire().await?;
        Self::chapter(&mut connection, chapter_id).await?;
        Repo::progress_in(&mut connection, chapter_id).await
    }

    pub async fn mark_progress(
        &self,
        input: MarkProgressInput,
    ) -> Result<ReviewProgress, AppError> {
        if input
            .anchor_json
            .as_ref()
            .is_some_and(|json| serde_json::from_str::<serde_json::Value>(json).is_err())
        {
            return Err(AppError::Validation(
                "A conclusão da revisão é inválida.".into(),
            ));
        }
        // Validação da regra do banco: anchor_json IS NOT NULL OR needs_recheck = 1
        if !input.needs_recheck
            && input
                .anchor_json
                .as_deref()
                .and_then(|json| serde_json::from_str::<serde_json::Value>(json).ok())
                .is_none_or(|value| {
                    value.get("completed").and_then(serde_json::Value::as_bool) != Some(true)
                })
        {
            return Err(AppError::Validation(
                "A conclusão da revisão é inválida.".into(),
            ));
        }
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter = Self::chapter(&mut tx, &input.chapter_id).await?;
        Self::profile(&mut tx, &input.profile_id).await?;
        Self::check_revision(&chapter, input.reviewed_content_revision)?;
        Self::check_revision(&chapter, input.anchor_revision)?;
        if !input.needs_recheck
            && Repo::list_in(&mut tx, &input.chapter_id)
                .await?
                .iter()
                .any(|comment| comment.status == "open")
        {
            return Err(AppError::Validation(
                "Resolva os comentários abertos antes de concluir a revisão.".into(),
            ));
        }
        let progress = Repo::save_progress_in(&mut tx, &input).await?;
        tx.commit().await?;
        Ok(progress)
    }
}

pub fn review_error(error: AppError) -> String {
    match error {
        AppError::Validation(message) | AppError::NotFound(message) => message,
        _ => "Não foi possível acessar a revisão neste dispositivo. Tente novamente.".into(),
    }
}

#[cfg(test)]
#[path = "review_tests.rs"]
mod tests;
