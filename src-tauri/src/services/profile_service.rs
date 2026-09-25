use crate::domain::profile::LocalProfile;
use crate::error::AppError;
use crate::repositories::profile_repository::ProfileRepository;
use sqlx::SqlitePool;

pub struct ProfileService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> ProfileService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Obtém o perfil local padrão da aplicação
    pub async fn get_default_profile(&self) -> Result<LocalProfile, AppError> {
        let repo = ProfileRepository::new(self.pool);
        repo.get_default().await
    }

    /// Valida e atualiza o nome de exibição do autor
    pub async fn update_display_name(
        &self,
        display_name: String,
    ) -> Result<LocalProfile, AppError> {
        let trimmed = display_name.trim();
        if trimmed.is_empty() {
            return Err(AppError::Validation(
                "O nome do autor não pode ser vazio".into(),
            ));
        }

        if trimmed.len() > 100 {
            return Err(AppError::Validation(
                "O nome do autor deve ter no máximo 100 caracteres".into(),
            ));
        }

        let repo = ProfileRepository::new(self.pool);
        let current = repo.get_default().await?;
        repo.update_display_name(&current.id, trimmed).await
    }
}
