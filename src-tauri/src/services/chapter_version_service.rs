use crate::domain::chapter::Chapter;
use crate::domain::chapter_version::{ChapterVersion, ChapterVersionSummary};
use crate::error::AppError;
use crate::repositories::chapter_repository::ChapterRepository;
use crate::repositories::chapter_version_repository::ChapterVersionRepository;
use crate::services::chapter_version_policy::{is_restorable, needs_snapshot, word_count};
use crate::services::review_service::ReviewService;
use sqlx::{SqliteConnection, SqlitePool};

pub struct ChapterVersionService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ChapterVersionService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    async fn chapter(connection: &mut SqliteConnection, id: &str) -> Result<Chapter, AppError> {
        ChapterRepository::find_in(connection, id)
            .await?
            .ok_or_else(|| AppError::NotFound("Capítulo não encontrado".into()))
    }

    /// Salva um snapshot da versão atual do capítulo
    pub async fn create_version(
        &self,
        chapter_id: &str,
        description: Option<&str>,
    ) -> Result<ChapterVersion, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter = Self::chapter(&mut tx, chapter_id).await?;
        let version = ChapterVersionRepository::create_in(
            &mut tx,
            &chapter,
            description,
            word_count(&chapter.content_json),
        )
        .await?;
        tx.commit().await?;
        Ok(version)
    }

    /// Lista todos os snapshots históricos de um capítulo
    pub async fn list_versions(
        &self,
        chapter_id: &str,
    ) -> Result<Vec<ChapterVersionSummary>, AppError> {
        ChapterVersionRepository::new(self.pool)
            .list_by_chapter(chapter_id)
            .await
    }

    /// Obtém uma versão específica por ID
    pub async fn get_version(&self, version_id: &str) -> Result<Option<ChapterVersion>, AppError> {
        ChapterVersionRepository::new(self.pool)
            .find_by_id(version_id)
            .await
    }

    /// Restaura o conteúdo de uma versão no capítulo atual
    pub async fn restore_version(
        &self,
        chapter_id: &str,
        version_id: &str,
        expected_revision: i64,
    ) -> Result<Chapter, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let version = ChapterVersionRepository::find_in(&mut tx, version_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Versão não encontrada".into()))?;
        if version.chapter_id != chapter_id {
            return Err(AppError::Validation(
                "A versão não pertence ao capítulo selecionado".into(),
            ));
        }
        if !is_restorable(&version.content_json) {
            return Err(AppError::Validation(
                "O conteúdo desta versão é inválido e não pode ser restaurado.".into(),
            ));
        }
        let current = Self::chapter(&mut tx, chapter_id).await?;
        // Atualiza o conteúdo do capítulo com a nova versão
        let updated = ChapterRepository::save_content_in(
            &mut tx,
            chapter_id,
            expected_revision,
            &version.content_json,
        )
        .await?
        .ok_or_else(|| {
            AppError::Validation(
                "O capítulo mudou desde que o histórico foi aberto. Atualize antes de restaurar."
                    .into(),
            )
        })?;
        // Antes de restaurar, salva um snapshot automático do estado que será substituído
        // Both writes commit together: a failed safety snapshot rolls the content update back.
        ReviewService::reconcile_in(&mut tx, &updated).await?;
        let description = format!("Antes de restaurar versão #{}", version.version_number);
        ChapterVersionRepository::create_in(
            &mut tx,
            &current,
            Some(&description),
            word_count(&current.content_json),
        )
        .await?;
        tx.commit().await?;
        Ok(updated)
    }

    /// Exclui um snapshot
    pub async fn delete_version(&self, version_id: &str) -> Result<bool, AppError> {
        ChapterVersionRepository::new(self.pool)
            .delete_version(version_id)
            .await
    }

    /// Ativa ou desativa o rastreamento de alterações para um capítulo
    pub async fn set_track_changes(
        &self,
        chapter_id: &str,
        enabled: bool,
    ) -> Result<Chapter, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter = ChapterVersionRepository::set_track_in(&mut tx, chapter_id, enabled).await?;
        if enabled {
            let latest = ChapterVersionRepository::latest_in(&mut tx, chapter_id).await?;
            if latest.is_none_or(|last| last.content_json != chapter.content_json) {
                ChapterVersionRepository::create_in(
                    &mut tx,
                    &chapter,
                    Some("Início do rastreamento"),
                    word_count(&chapter.content_json),
                )
                .await?;
            }
        }
        tx.commit().await?;
        Ok(chapter)
    }

    /// Cria um snapshot automático se as condições de rastreamento forem atendidas
    async fn auto_in(
        connection: &mut SqliteConnection,
        chapter: &Chapter,
    ) -> Result<Option<ChapterVersion>, AppError> {
        if !chapter.track_changes_enabled {
            return Ok(None);
        }
        let latest = ChapterVersionRepository::latest_in(connection, &chapter.id).await?;
        let should_create = if let Some(last) = latest {
            let seconds = ChapterVersionRepository::seconds_in(connection, &last.id).await?;
            needs_snapshot(&last.content_json, &chapter.content_json, seconds)
        } else {
            true
        };
        if should_create {
            Ok(Some(
                ChapterVersionRepository::create_in(
                    connection,
                    chapter,
                    Some("Snapshot automático"),
                    word_count(&chapter.content_json),
                )
                .await?,
            ))
        } else {
            Ok(None)
        }
    }

    pub async fn checkpoint(&self, chapter_id: &str) -> Result<Option<ChapterVersion>, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter = Self::chapter(&mut tx, chapter_id).await?;
        let version = Self::auto_in(&mut tx, &chapter).await?;
        tx.commit().await?;
        Ok(version)
    }

    pub async fn save_with_history(
        &self,
        id: &str,
        expected_revision: i64,
        content_json: &str,
    ) -> Result<Chapter, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let chapter =
            ChapterRepository::save_content_in(&mut tx, id, expected_revision, content_json)
                .await?
                .ok_or_else(|| {
                    AppError::Validation(
                "Conflito de edição: o capítulo foi modificado por outra operação ou não existe."
                    .into(),
            )
                })?;
        ReviewService::reconcile_in(&mut tx, &chapter).await?;
        Self::auto_in(&mut tx, &chapter).await?;
        tx.commit().await?;
        Ok(chapter)
    }
}

#[cfg(test)]
#[path = "chapter_version_tests.rs"]
mod tests;
