use crate::domain::book::Book;
use crate::domain::series::{BookSeries, CreateSeriesInput, UpdateSeriesInput};
use crate::domain::universe::CreateUniverseInput;
use crate::services::book_service::BookService;
use crate::services::series_service::SeriesService;
use crate::services::universe_service::UniverseService;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::SqlitePool;

struct Fixture {
    pool: SqlitePool,
    series: BookSeries,
    books: Vec<Book>,
    standalone: Book,
    other_universe: String,
}

async fn fixture() -> Fixture {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    let (profile, format, font): (String, String, String) = sqlx::query_as(
        "SELECT p.id, f.id, t.id FROM local_profiles p, book_formats f, font_presets t LIMIT 1",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    let mut universes = Vec::new();
    for name in ["Primeiro mundo", "Segundo mundo"] {
        universes.push(
            UniverseService::new(&pool)
                .create_universe(CreateUniverseInput {
                    profile_id: profile.clone(),
                    name: name.into(),
                    description: None,
                })
                .await
                .unwrap(),
        );
    }
    let series = SeriesService::new(&pool)
        .create_series(CreateSeriesInput {
            profile_id: profile.clone(),
            universe_id: Some(universes[0].id.clone()),
            name: "Saga".into(),
            description: None,
        })
        .await
        .unwrap();
    let mut books = Vec::new();
    for (title, series_id) in [
        ("Primeiro", Some(&series.id)),
        ("Segundo", Some(&series.id)),
        ("Avulso", None),
    ] {
        let input = serde_json::from_value(serde_json::json!({
            "profile_id": profile, "format_id": format, "font_preset_id": font,
            "title": title, "author_name": "Autor", "series_id": series_id,
            "universe_id": universes[0].id,
        }))
        .unwrap();
        books.push(BookService::new(&pool).create_book(input).await.unwrap());
    }
    Fixture {
        standalone: books.pop().unwrap(),
        other_universe: universes[1].id.clone(),
        pool,
        series,
        books,
    }
}

#[test]
fn universe_changes_and_detachment_move_only_the_series_books() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        let service = SeriesService::new(&f.pool);
        for input in [
            serde_json::json!({"name": "Saga renomeada"}),
            serde_json::json!({"universe_id": f.other_universe}),
            serde_json::json!({"clear_universe": true}),
            serde_json::json!({"universe_id": ""}),
        ] {
            let updated = service
                .update_series(&f.series.id, serde_json::from_value(input).unwrap())
                .await
                .unwrap();
            for original in &f.books {
                let book = BookService::new(&f.pool)
                    .get_book_by_id(&original.id)
                    .await
                    .unwrap()
                    .unwrap();
                assert_eq!(book.universe_id, updated.universe_id);
                assert_eq!(book.series_id, original.series_id);
                assert_eq!(book.series_volume, original.series_volume);
            }
            let standalone = BookService::new(&f.pool)
                .get_book_by_id(&f.standalone.id)
                .await
                .unwrap()
                .unwrap();
            assert_eq!(standalone.universe_id, f.standalone.universe_id);
            assert!(standalone.series_id.is_none());
        }
        let books = BookService::new(&f.pool)
            .list_books(&f.series.profile_id)
            .await
            .unwrap();
        assert_eq!(books.len(), 3);
    });
}

#[test]
fn failed_book_unlink_rolls_back_the_series_unlink() {
    tauri::async_runtime::block_on(async {
        let f = fixture().await;
        sqlx::query(
            "CREATE TRIGGER reject_unlink BEFORE UPDATE OF universe_id ON books \
             WHEN OLD.series_id IS NOT NULL AND NEW.universe_id IS NULL \
             BEGIN SELECT RAISE(ABORT, 'test failure'); END",
        )
        .execute(&f.pool)
        .await
        .unwrap();
        let service = SeriesService::new(&f.pool);
        let input: UpdateSeriesInput =
            serde_json::from_value(serde_json::json!({"clear_universe": true})).unwrap();
        assert!(service.update_series(&f.series.id, input).await.is_err());
        let series = service
            .get_series_by_id(&f.series.id)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(series.universe_id, f.series.universe_id);
        for original in &f.books {
            let book = BookService::new(&f.pool)
                .get_book_by_id(&original.id)
                .await
                .unwrap()
                .unwrap();
            assert_eq!(book.universe_id, original.universe_id);
            assert_eq!(book.series_id, original.series_id);
            assert_eq!(book.series_volume, original.series_volume);
        }
    });
}
