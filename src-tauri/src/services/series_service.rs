use crate::domain::book::Book;
use crate::domain::series::{BookSeries, CreateSeriesInput, UpdateSeriesInput};
use crate::error::AppError;
use crate::repositories::series_repository::SeriesRepository;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct SeriesService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> SeriesService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_series(&self, input: CreateSeriesInput) -> Result<BookSeries, AppError> {
        let name = input.name.trim();
        if name.is_empty() {
            return Err(AppError::Validation(
                "O nome da série não pode ser vazio".into(),
            ));
        }

        let description = input
            .description
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty());

        let universe_id = input
            .universe_id
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty());

        let repo = SeriesRepository::new(self.pool);
        let next_position = repo.get_next_position(&input.profile_id).await?;
        let series_id = Uuid::now_v7().to_string();

        repo.create(
            &series_id,
            &input.profile_id,
            universe_id,
            name,
            description,
            next_position,
        )
        .await
    }

    pub async fn list_series(&self, profile_id: &str) -> Result<Vec<BookSeries>, AppError> {
        let repo = SeriesRepository::new(self.pool);
        repo.list_by_profile(profile_id).await
    }

    pub async fn get_series_by_id(&self, id: &str) -> Result<Option<BookSeries>, AppError> {
        let repo = SeriesRepository::new(self.pool);
        repo.find_by_id(id).await
    }

    pub async fn update_series(
        &self,
        id: &str,
        input: UpdateSeriesInput,
    ) -> Result<BookSeries, AppError> {
        let trimmed_name = match input.name {
            Some(ref raw) => {
                let t = raw.trim();
                if t.is_empty() {
                    return Err(AppError::Validation(
                        "O nome da série não pode ser vazio".into(),
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

        let universe_opt = if input.clear_universe.unwrap_or(false) {
            Some(None)
        } else {
            input.universe_id.as_ref().map(|u| {
                let t = u.trim();
                if t.is_empty() {
                    None
                } else {
                    Some(t)
                }
            })
        };

        let repo = SeriesRepository::new(self.pool);
        repo.update(id, trimmed_name.as_deref(), description_opt, universe_opt)
            .await
    }

    pub async fn reorder_series(
        &self,
        profile_id: &str,
        series_ids: &[String],
    ) -> Result<(), AppError> {
        let repo = SeriesRepository::new(self.pool);
        repo.reorder_series(profile_id, series_ids).await
    }

    pub async fn reorder_series_books(
        &self,
        series_id: &str,
        book_ids: &[String],
    ) -> Result<Vec<Book>, AppError> {
        let repo = SeriesRepository::new(self.pool);
        repo.reorder_books(series_id, book_ids).await
    }

    pub async fn delete_series(&self, id: &str) -> Result<(), AppError> {
        let repo = SeriesRepository::new(self.pool);
        repo.soft_delete(id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::book::{CreateBookInput, UpdateBookInput};
    use crate::domain::universe::CreateUniverseInput;
    use crate::services::book_service::BookService;
    use crate::services::universe_service::UniverseService;
    use sqlx::sqlite::SqlitePoolOptions;

    async fn setup_pool() -> (SqlitePool, String, String, String) {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();

        let (profile_id,): (String,) = sqlx::query_as("SELECT id FROM local_profiles LIMIT 1")
            .fetch_one(&pool)
            .await
            .unwrap();
        let (format_id,): (String,) = sqlx::query_as("SELECT id FROM book_formats LIMIT 1")
            .fetch_one(&pool)
            .await
            .unwrap();
        let (font_id,): (String,) = sqlx::query_as("SELECT id FROM font_presets LIMIT 1")
            .fetch_one(&pool)
            .await
            .unwrap();

        (pool, profile_id, format_id, font_id)
    }

    #[test]
    fn series_auto_numbering_reordering_and_universe_inheritance() {
        tauri::async_runtime::block_on(async {
            let (pool, profile_id, format_id, font_id) = setup_pool().await;
            let universe_svc = UniverseService::new(&pool);
            let series_svc = SeriesService::new(&pool);
            let book_svc = BookService::new(&pool);

            // 1. Cria Universo "Legendarium"
            let universe = universe_svc
                .create_universe(CreateUniverseInput {
                    profile_id: profile_id.clone(),
                    name: "Legendarium".into(),
                    description: Some("Terra-média".into()),
                })
                .await
                .unwrap();

            // 2. Cria Série "O Senhor dos Anéis" vinculada ao Universo
            let series = series_svc
                .create_series(CreateSeriesInput {
                    profile_id: profile_id.clone(),
                    universe_id: Some(universe.id.clone()),
                    name: "O Senhor dos Anéis".into(),
                    description: Some("Trilogia do Anel".into()),
                })
                .await
                .unwrap();

            assert_eq!(series.universe_id.as_deref(), Some(universe.id.as_str()));

            // 3. Cria 3 livros na série -> volumes automáticos 1, 2, 3 e herança de universo
            let mut created = Vec::new();
            for title in ["A Sociedade do Anel", "As Duas Torres", "O Retorno do Rei"] {
                let b = book_svc
                    .create_book(CreateBookInput {
                        profile_id: profile_id.clone(),
                        format_id: format_id.clone(),
                        font_preset_id: font_id.clone(),
                        universe_id: None,
                        series_id: Some(series.id.clone()),
                        title: title.into(),
                        author_name: "J.R.R. Tolkien".into(),
                        synopsis: None,
                        font_size_pt: None,
                        line_height_ratio: None,
                        margin_top_um: None,
                        margin_bottom_um: None,
                        margin_left_um: None,
                        margin_right_um: None,
                    })
                    .await
                    .unwrap();
                created.push(b);
            }

            assert_eq!(created[0].series_volume, Some(1));
            assert_eq!(created[1].series_volume, Some(2));
            assert_eq!(created[2].series_volume, Some(3));
            assert_eq!(
                created[0].universe_id.as_deref(),
                Some(universe.id.as_str())
            );

            // 4. Reordena os livros na série: [Vol 3, Vol 1, Vol 2]
            let reordered = series_svc
                .reorder_series_books(
                    &series.id,
                    &[
                        created[2].id.clone(),
                        created[0].id.clone(),
                        created[1].id.clone(),
                    ],
                )
                .await
                .unwrap();

            assert_eq!(reordered[0].id, created[2].id);
            assert_eq!(reordered[0].series_volume, Some(1));
            assert_eq!(reordered[1].id, created[0].id);
            assert_eq!(reordered[1].series_volume, Some(2));
            assert_eq!(reordered[2].id, created[1].id);
            assert_eq!(reordered[2].series_volume, Some(3));

            // 5. Remove o livro do meio da série -> o último deve ser renumerado para Vol. 2
            let detached = book_svc
                .update_book(
                    &reordered[1].id,
                    UpdateBookInput {
                        title: None,
                        author_name: None,
                        format_id: None,
                        font_preset_id: None,
                        card_image_asset_id: None,
                        universe_id: None,
                        clear_universe: None,
                        series_id: None,
                        clear_series: Some(true),
                        font_size_pt: None,
                        line_height_ratio: None,
                        margin_top_um: None,
                        margin_bottom_um: None,
                        margin_left_um: None,
                        margin_right_um: None,
                    },
                )
                .await
                .unwrap();
            assert!(detached.series_id.is_none());
            assert!(detached.series_volume.is_none());

            let remaining_last = book_svc
                .get_book_by_id(&reordered[2].id)
                .await
                .unwrap()
                .unwrap();
            assert_eq!(remaining_last.series_volume, Some(2));

            // 6. Excluir a série limpa series_id e series_volume dos livros restantes
            series_svc.delete_series(&series.id).await.unwrap();
            let after_series_del = book_svc
                .get_book_by_id(&reordered[0].id)
                .await
                .unwrap()
                .unwrap();
            assert!(after_series_del.series_id.is_none());
            assert!(after_series_del.series_volume.is_none());
        });
    }
}
