use crate::domain::chapter::{Chapter, ChapterSummary, CreateChapterInput};
use crate::error::AppError;
use crate::repositories::chapter_repository::ChapterRepository;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct ChapterService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ChapterService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Cria um novo capítulo com documento JSON inicial e UUIDv7
    pub async fn create_chapter(&self, input: CreateChapterInput) -> Result<Chapter, AppError> {
        let title = input.title.trim();
        if title.is_empty() {
            return Err(AppError::Validation(
                "O título do capítulo não pode ser vazio".into(),
            ));
        }

        let repo = ChapterRepository::new(self.pool);
        let position = repo.get_next_position(&input.book_id).await?;
        let chapter_id = Uuid::now_v7().to_string();

        // Estrutura padrão de documento vazio em blocos JSON
        let content_json = input
            .content_json
            .unwrap_or_else(|| r#"{"version":1,"type":"doc","blocks":[]}"#.to_string());

        repo.create(&chapter_id, &input.book_id, title, position, &content_json)
            .await
    }

    pub async fn list_chapters(&self, book_id: &str) -> Result<Vec<ChapterSummary>, AppError> {
        let repo = ChapterRepository::new(self.pool);
        repo.list_by_book(book_id).await
    }

    pub async fn get_chapter_by_id(&self, id: &str) -> Result<Option<Chapter>, AppError> {
        let repo = ChapterRepository::new(self.pool);
        repo.find_by_id(id).await
    }

    pub async fn update_chapter_title(&self, id: &str, title: &str) -> Result<Chapter, AppError> {
        let trimmed = title.trim();
        if trimmed.is_empty() {
            return Err(AppError::Validation(
                "O título do capítulo não pode ser vazio".into(),
            ));
        }

        let repo = ChapterRepository::new(self.pool);
        repo.update_title(id, trimmed).await
    }

    /// Salva o conteúdo com verificação de revisão concorrente (optimistic locking)
    pub async fn save_chapter_content(
        &self,
        id: &str,
        expected_revision: i64,
        content_json: &str,
    ) -> Result<Chapter, AppError> {
        // Validação leve de integridade: garante que é um JSON válido
        if serde_json::from_str::<serde_json::Value>(content_json).is_err() {
            return Err(AppError::Validation(
                "O conteúdo fornecido não é um JSON válido".into(),
            ));
        }

        let repo = ChapterRepository::new(self.pool);
        let updated = repo
            .save_content(id, expected_revision, content_json)
            .await?;

        match updated {
            Some(chapter) => Ok(chapter),
            None => Err(AppError::Validation(
                "Conflito de edição: o capítulo foi modificado por outra operação ou não existe."
                    .into(),
            )),
        }
    }

    pub async fn reorder_chapters(
        &self,
        book_id: &str,
        chapter_ids: &[String],
    ) -> Result<(), AppError> {
        let repo = ChapterRepository::new(self.pool);
        repo.reorder(book_id, chapter_ids).await
    }

    pub async fn delete_chapter(&self, id: &str) -> Result<(), AppError> {
        let repo = ChapterRepository::new(self.pool);
        repo.soft_delete(id).await
    }
}
