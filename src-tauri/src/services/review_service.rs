use crate::domain::review::{CreateCommentInput, MarkProgressInput, ReviewComment, ReviewProgress};
use crate::error::AppError;
use crate::repositories::review_repository::ReviewRepository;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct ReviewService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ReviewService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_comment(
        &self,
        input: CreateCommentInput,
    ) -> Result<ReviewComment, AppError> {
        let body = input.body.trim();
        if body.is_empty() {
            return Err(AppError::Validation(
                "O comentário não pode ser vazio".into(),
            ));
        }

        let excerpt = input.original_excerpt.trim();
        if excerpt.is_empty() {
            return Err(AppError::Validation(
                "O trecho selecionado não pode ser vazio".into(),
            ));
        }

        let comment_id = Uuid::now_v7().to_string();
        let anchor_state = if input.anchor_json.is_some() {
            "attached"
        } else {
            "removed"
        };

        let repo = ReviewRepository::new(self.pool);
        repo.create_comment(
            &comment_id,
            &input.chapter_id,
            &input.author_profile_id,
            body,
            excerpt,
            input.anchor_json.as_deref(),
            input.anchor_revision,
            anchor_state,
        )
        .await
    }

    pub async fn list_comments(&self, chapter_id: &str) -> Result<Vec<ReviewComment>, AppError> {
        let repo = ReviewRepository::new(self.pool);
        repo.list_comments_by_chapter(chapter_id).await
    }

    pub async fn resolve_comment(&self, id: &str) -> Result<ReviewComment, AppError> {
        let repo = ReviewRepository::new(self.pool);
        repo.resolve_comment(id).await
    }

    pub async fn reopen_comment(&self, id: &str) -> Result<ReviewComment, AppError> {
        let repo = ReviewRepository::new(self.pool);
        repo.reopen_comment(id).await
    }

    pub async fn get_progress(&self, chapter_id: &str) -> Result<Option<ReviewProgress>, AppError> {
        let repo = ReviewRepository::new(self.pool);
        repo.get_progress(chapter_id).await
    }

    pub async fn mark_progress(
        &self,
        input: MarkProgressInput,
    ) -> Result<ReviewProgress, AppError> {
        // Validação da regra do banco: anchor_json IS NOT NULL OR needs_recheck = 1
        if input.anchor_json.is_none() && !input.needs_recheck {
            return Err(AppError::Validation(
                "Uma revisão sem âncora deve obrigatoriamente ser marcada com 'precisa rever'"
                    .into(),
            ));
        }

        let repo = ReviewRepository::new(self.pool);
        repo.save_progress(
            &input.chapter_id,
            &input.profile_id,
            input.anchor_json.as_deref(),
            input.anchor_revision,
            input.reviewed_content_revision,
            input.needs_recheck,
        )
        .await
    }
}
