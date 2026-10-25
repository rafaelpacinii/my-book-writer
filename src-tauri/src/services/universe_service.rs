use crate::domain::universe::{CreateUniverseInput, Universe, UpdateUniverseInput};
use crate::error::AppError;
use crate::repositories::universe_repository::UniverseRepository;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct UniverseService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> UniverseService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_universe(&self, input: CreateUniverseInput) -> Result<Universe, AppError> {
        let name = input.name.trim();
        if name.is_empty() {
            return Err(AppError::Validation(
                "O nome do universo não pode ser vazio".into(),
            ));
        }

        let description = input
            .description
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty());

        let repo = UniverseRepository::new(self.pool);
        let next_position = repo.get_next_position(&input.profile_id).await?;
        let universe_id = Uuid::now_v7().to_string();

        repo.create(
            &universe_id,
            &input.profile_id,
            name,
            description,
            next_position,
        )
        .await
    }

    pub async fn list_universes(&self, profile_id: &str) -> Result<Vec<Universe>, AppError> {
        let repo = UniverseRepository::new(self.pool);
        repo.list_by_profile(profile_id).await
    }

    pub async fn get_universe_by_id(&self, id: &str) -> Result<Option<Universe>, AppError> {
        let repo = UniverseRepository::new(self.pool);
        repo.find_by_id(id).await
    }

    pub async fn update_universe(
        &self,
        id: &str,
        input: UpdateUniverseInput,
    ) -> Result<Universe, AppError> {
        let trimmed_name = match input.name {
            Some(ref raw) => {
                let t = raw.trim();
                if t.is_empty() {
                    return Err(AppError::Validation(
                        "O nome do universo não pode ser vazio".into(),
                    ));
                }
                Some(t.to_string())
            }
            None => None,
        };

        let description_opt = input.description.as_ref().map(|d| {
            let t = d.trim();
            if t.is_empty() {
                None
            } else {
                Some(t)
            }
        });

        let repo = UniverseRepository::new(self.pool);
        repo.update(id, trimmed_name.as_deref(), description_opt)
            .await
    }

    pub async fn reorder_universes(
        &self,
        profile_id: &str,
        universe_ids: &[String],
    ) -> Result<(), AppError> {
        let repo = UniverseRepository::new(self.pool);
        repo.reorder(profile_id, universe_ids).await
    }

    pub async fn delete_universe(&self, id: &str) -> Result<(), AppError> {
        let repo = UniverseRepository::new(self.pool);
        repo.soft_delete(id).await
    }
}
