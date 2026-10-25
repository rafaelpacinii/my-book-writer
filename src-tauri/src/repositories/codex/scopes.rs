use super::CodexRepository;
use crate::domain::codex::*;
use crate::error::AppError;
use sqlx::SqliteConnection;

impl CodexRepository {
    pub async fn profile(conn: &mut SqliteConnection, id: &str) -> Result<(), AppError> {
        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM local_profiles WHERE id = ?)")
                .bind(id)
                .fetch_one(conn)
                .await?;
        if !exists {
            return Err(AppError::NotFound("Perfil não encontrado".into()));
        }
        Ok(())
    }
    pub async fn scope(
        conn: &mut SqliteConnection,
        input: &CodexScopeInput,
    ) -> Result<CodexScope, AppError> {
        if input
            .book_id
            .as_ref()
            .is_some_and(|id| id.trim().is_empty())
            || input
                .universe_id
                .as_ref()
                .is_some_and(|id| id.trim().is_empty())
        {
            return Err(AppError::Validation(
                "Informe exatamente um Livro ou Universo para o Códice".into(),
            ));
        }
        Self::profile(conn, &input.profile_id).await?;
        let mut result = CodexScope {
            profile_id: input.profile_id.clone(),
            book_id: None,
            universe_id: None,
            is_archived: false,
        };
        match (&input.book_id, &input.universe_id) {
            (Some(book), None) => {
                let row: Option<(Option<String>, bool)> = sqlx::query_as(
                    "SELECT COALESCE(u.id, su.id), b.deleted_at IS NOT NULL FROM books b
                     LEFT JOIN universes u ON u.id=b.universe_id AND u.profile_id=b.profile_id AND u.deleted_at IS NULL
                     LEFT JOIN book_series s ON s.id=b.series_id AND s.profile_id=b.profile_id AND s.deleted_at IS NULL
                     LEFT JOIN universes su ON su.id=s.universe_id AND su.profile_id=b.profile_id AND su.deleted_at IS NULL
                     WHERE b.id=? AND b.profile_id=?")
                    .bind(book).bind(&input.profile_id).fetch_optional(&mut *conn).await?;
                let (universe, archived) = row.ok_or_else(|| {
                    AppError::NotFound("Livro não encontrado neste perfil".into())
                })?;
                result.is_archived = archived;
                if archived || universe.is_none() {
                    result.book_id = Some(book.clone());
                } else {
                    result.universe_id = universe;
                }
            }
            (None, Some(universe)) => {
                let archived: Option<bool> = sqlx::query_scalar(
                    "SELECT deleted_at IS NOT NULL FROM universes WHERE id=? AND profile_id=?",
                )
                .bind(universe)
                .bind(&input.profile_id)
                .fetch_optional(&mut *conn)
                .await?;
                result.is_archived = archived.ok_or_else(|| {
                    AppError::NotFound("Universo não encontrado neste perfil".into())
                })?;
                result.universe_id = Some(universe.clone());
            }
            _ => {
                return Err(AppError::Validation(
                    "Informe exatamente um Livro ou Universo para o Códice".into(),
                ))
            }
        }
        // Também recupera vínculos criados antes da instalação dos triggers.
        if let (Some(book), Some(universe)) = (&input.book_id, &result.universe_id) {
            sqlx::query("UPDATE codex_entities SET book_id=NULL, universe_id=?, updated_at=datetime('now') WHERE book_id=? AND profile_id=?")
                .bind(universe).bind(book).bind(&input.profile_id).execute(conn).await?;
        }
        Ok(result)
    }
    pub async fn contexts(
        conn: &mut SqliteConnection,
        profile: &str,
    ) -> Result<Vec<CodexContext>, AppError> {
        Self::profile(conn, profile).await?;
        Ok(sqlx::query_as::<_, CodexContext>(
            "SELECT id, name, 'universe' AS kind, deleted_at IS NOT NULL AS is_archived FROM universes u
             WHERE profile_id=? AND (deleted_at IS NULL OR EXISTS(SELECT 1 FROM codex_entities e WHERE e.universe_id=u.id AND e.deleted_at IS NULL))
             UNION ALL SELECT id, title AS name, 'book' AS kind, deleted_at IS NOT NULL AS is_archived FROM books b
             WHERE profile_id=? AND ((deleted_at IS NULL AND NOT EXISTS(
                SELECT 1 FROM universes u WHERE u.id=b.universe_id AND u.deleted_at IS NULL) AND NOT EXISTS(
                SELECT 1 FROM book_series s JOIN universes u ON u.id=s.universe_id WHERE s.id=b.series_id AND s.deleted_at IS NULL AND u.deleted_at IS NULL))
             OR EXISTS(SELECT 1 FROM codex_entities e WHERE e.book_id=b.id AND e.deleted_at IS NULL)) ORDER BY is_archived, name, id")
            .bind(profile).bind(profile).fetch_all(conn).await?)
    }
}
