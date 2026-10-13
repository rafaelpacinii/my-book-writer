use crate::domain::chapter::Chapter;
use crate::domain::chapter_version::{ChapterVersion, ChapterVersionSummary};
use crate::error::AppError;
use crate::repositories::chapter_repository::ChapterRepository;
use crate::repositories::chapter_version_repository::ChapterVersionRepository;
use sqlx::SqlitePool;

pub struct ChapterVersionService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ChapterVersionService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Salva um snapshot da versão atual do capítulo
    pub async fn create_version(
        &self,
        chapter_id: &str,
        description: Option<&str>,
    ) -> Result<ChapterVersion, AppError> {
        let chapter_repo = ChapterRepository::new(self.pool);
        let chapter = chapter_repo
            .find_by_id(chapter_id)
            .await?
            .ok_or_else(|| AppError::Validation("Capítulo não encontrado".into()))?;

        let word_count = extract_words_from_json(&chapter.content_json);

        let repo = ChapterVersionRepository::new(self.pool);
        repo.create_version(&chapter, description, word_count).await
    }

    /// Lista todos os snapshots históricos de um capítulo
    pub async fn list_versions(
        &self,
        chapter_id: &str,
    ) -> Result<Vec<ChapterVersionSummary>, AppError> {
        let repo = ChapterVersionRepository::new(self.pool);
        repo.list_by_chapter(chapter_id).await
    }

    /// Obtém uma versão específica por ID
    pub async fn get_version(&self, version_id: &str) -> Result<Option<ChapterVersion>, AppError> {
        let repo = ChapterVersionRepository::new(self.pool);
        repo.find_by_id(version_id).await
    }

    /// Restaura o conteúdo de uma versão no capítulo atual
    pub async fn restore_version(
        &self,
        chapter_id: &str,
        version_id: &str,
    ) -> Result<Chapter, AppError> {
        let repo = ChapterVersionRepository::new(self.pool);
        let version = repo
            .find_by_id(version_id)
            .await?
            .ok_or_else(|| AppError::Validation("Versão não encontrada".into()))?;

        if version.chapter_id != chapter_id {
            return Err(AppError::Validation(
                "A versão não pertence ao capítulo selecionado".into(),
            ));
        }

        let chapter_repo = ChapterRepository::new(self.pool);
        let current_chapter = chapter_repo
            .find_by_id(chapter_id)
            .await?
            .ok_or_else(|| AppError::Validation("Capítulo não encontrado".into()))?;

        // Antes de restaurar, salva um snapshot automático do estado que será substituído
        let current_word_count = extract_words_from_json(&current_chapter.content_json);
        let auto_desc = format!("Antes de restaurar versão #{}", version.version_number);
        repo.create_version(&current_chapter, Some(&auto_desc), current_word_count)
            .await?;

        // Atualiza o conteúdo do capítulo com a nova versão
        let updated = chapter_repo
            .save_content(
                chapter_id,
                current_chapter.content_revision,
                &version.content_json,
            )
            .await?;

        match updated {
            Some(chap) => Ok(chap),
            None => Err(AppError::Validation(
                "Conflito de edição ao tentar restaurar versão".into(),
            )),
        }
    }

    /// Exclui um snapshot
    pub async fn delete_version(&self, version_id: &str) -> Result<bool, AppError> {
        let repo = ChapterVersionRepository::new(self.pool);
        repo.delete_version(version_id).await
    }

    /// Ativa ou desativa o rastreamento de alterações para um capítulo
    pub async fn set_track_changes(
        &self,
        chapter_id: &str,
        enabled: bool,
    ) -> Result<Chapter, AppError> {
        let repo = ChapterVersionRepository::new(self.pool);
        repo.set_track_changes(chapter_id, enabled).await
    }
}

/// Extrai a contagem de palavras do JSON canônico de forma simples
fn extract_words_from_json(content_json: &str) -> i64 {
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(content_json) {
        if let Some(wc) = val.get("word_count").and_then(|w| w.as_i64()) {
            return wc;
        }
        if let Some(text) = val.get("text").and_then(|t| t.as_str()) {
            return text.split_whitespace().count() as i64;
        }
    }
    0
}
