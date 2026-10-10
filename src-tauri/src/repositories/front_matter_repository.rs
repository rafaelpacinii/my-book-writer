use crate::domain::front_matter::{BookFrontMatter, SaveFrontMatterInput};
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct FrontMatterRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> FrontMatterRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_by_book_id(&self, book_id: &str) -> Result<Option<BookFrontMatter>, AppError> {
        let front_matter = sqlx::query_as::<_, BookFrontMatter>(
            "SELECT * FROM book_front_matter WHERE book_id = ?"
        )
        .bind(book_id)
        .fetch_optional(self.pool)
        .await?;

        Ok(front_matter)
    }

    pub async fn upsert(&self, input: &SaveFrontMatterInput) -> Result<BookFrontMatter, AppError> {
        let front_matter = sqlx::query_as::<_, BookFrontMatter>(
            r#"
            INSERT INTO book_front_matter (
                book_id, include_half_title, include_title_page, subtitle, publisher,
                edition, publication_year, publication_city, include_copyright_page,
                copyright_text, isbn_print, isbn_digital, cover_designer, proofreader,
                layout_designer, cataloging_data, include_dedication, dedication_text,
                include_epigraph, epigraph_text, epigraph_author, include_table_of_contents,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                datetime('now'), datetime('now')
            )
            ON CONFLICT(book_id) DO UPDATE SET
                include_half_title = excluded.include_half_title,
                include_title_page = excluded.include_title_page,
                subtitle = excluded.subtitle,
                publisher = excluded.publisher,
                edition = excluded.edition,
                publication_year = excluded.publication_year,
                publication_city = excluded.publication_city,
                include_copyright_page = excluded.include_copyright_page,
                copyright_text = excluded.copyright_text,
                isbn_print = excluded.isbn_print,
                isbn_digital = excluded.isbn_digital,
                cover_designer = excluded.cover_designer,
                proofreader = excluded.proofreader,
                layout_designer = excluded.layout_designer,
                cataloging_data = excluded.cataloging_data,
                include_dedication = excluded.include_dedication,
                dedication_text = excluded.dedication_text,
                include_epigraph = excluded.include_epigraph,
                epigraph_text = excluded.epigraph_text,
                epigraph_author = excluded.epigraph_author,
                include_table_of_contents = excluded.include_table_of_contents,
                updated_at = datetime('now')
            RETURNING *
            "#
        )
        .bind(&input.book_id)
        .bind(input.include_half_title)
        .bind(input.include_title_page)
        .bind(&input.subtitle)
        .bind(&input.publisher)
        .bind(&input.edition)
        .bind(input.publication_year)
        .bind(&input.publication_city)
        .bind(input.include_copyright_page)
        .bind(&input.copyright_text)
        .bind(&input.isbn_print)
        .bind(&input.isbn_digital)
        .bind(&input.cover_designer)
        .bind(&input.proofreader)
        .bind(&input.layout_designer)
        .bind(&input.cataloging_data)
        .bind(input.include_dedication)
        .bind(&input.dedication_text)
        .bind(input.include_epigraph)
        .bind(&input.epigraph_text)
        .bind(&input.epigraph_author)
        .bind(input.include_table_of_contents)
        .fetch_one(self.pool)
        .await?;

        Ok(front_matter)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;

    #[test]
    fn test_front_matter_upsert_and_fetch() {
        tauri::async_runtime::block_on(async {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();

        sqlx::query("INSERT INTO local_profiles (id, display_name, created_at, updated_at) VALUES ('p1', 'Autor Teste', '2026-10-10', '2026-10-10')").execute(&pool).await.unwrap();
        sqlx::query("INSERT INTO book_formats (id, name, market, width_um, height_um, is_active) VALUES ('fmt1', '14x21', 'BR', 140000, 210000, 1)").execute(&pool).await.unwrap();
        sqlx::query("INSERT INTO font_presets (id, name, family_name, manifest_path, is_active) VALUES ('fnt1', 'Merriweather', 'Merriweather', '', 1)").execute(&pool).await.unwrap();
        sqlx::query("INSERT INTO books (id, profile_id, format_id, font_preset_id, title, author_name, position, font_size_pt, line_height_ratio, margin_top_um, margin_bottom_um, margin_left_um, margin_right_um, created_at, updated_at) VALUES ('b1', 'p1', 'fmt1', 'fnt1', 'Livro Teste', 'Autor Teste', 0, 11.0, 1.6, 20000, 20000, 20000, 20000, '2026-10-10', '2026-10-10')").execute(&pool).await.unwrap();

        let repo = FrontMatterRepository::new(&pool);
        let none = repo.get_by_book_id("b1").await.unwrap();
        assert!(none.is_none());

        let input = SaveFrontMatterInput {
            book_id: "b1".into(),
            include_half_title: true,
            include_title_page: true,
            subtitle: Some("O Começo de Tudo".into()),
            publisher: Some("Editora Imaginária".into()),
            edition: "1ª edição".into(),
            publication_year: Some(2026),
            publication_city: Some("São Paulo".into()),
            include_copyright_page: true,
            copyright_text: Some("© 2026 Autor Teste".into()),
            isbn_print: Some("978-65-00-00000-0".into()),
            isbn_digital: Some("978-65-00-00000-1".into()),
            cover_designer: Some("Capista".into()),
            proofreader: Some("Revisor".into()),
            layout_designer: Some("Diagramador".into()),
            cataloging_data: None,
            include_dedication: true,
            dedication_text: Some("Para todos os leitores".into()),
            include_epigraph: false,
            epigraph_text: None,
            epigraph_author: None,
            include_table_of_contents: true,
        };

        let saved = repo.upsert(&input).await.unwrap();
        assert_eq!(saved.subtitle, Some("O Começo de Tudo".into()));
        assert_eq!(saved.edition, "1ª edição");
        assert!(saved.include_dedication);

        let fetched = repo.get_by_book_id("b1").await.unwrap().unwrap();
        assert_eq!(fetched.publisher, Some("Editora Imaginária".into()));
        assert_eq!(fetched.isbn_print, Some("978-65-00-00000-0".into()));
        });
    }
}
