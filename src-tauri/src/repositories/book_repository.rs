use crate::domain::book::{Book, UpdateBookInput};
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct BookRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> BookRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Descobre a próxima posição livre na estante para ordenar os livros
    pub async fn get_next_position(&self, profile_id: &str) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM books WHERE profile_id = ? AND deleted_at IS NULL"
        )
        .bind(profile_id)
        .fetch_one(self.pool)
        .await?;

        Ok(row.0)
    }

    /// Insere um novo livro no SQLite e retorna o registro criado
    #[allow(clippy::too_many_arguments)]
    pub async fn create(
        &self,
        id: &str,
        profile_id: &str,
        format_id: &str,
        font_preset_id: &str,
        title: &str,
        author_name: &str,
        card_image_asset_id: Option<&str>,
        position: i64,
        font_size_pt: f64,
        line_height_ratio: f64,
        margin_top_um: i64,
        margin_bottom_um: i64,
        margin_left_um: i64,
        margin_right_um: i64,
    ) -> Result<Book, AppError> {
        let book = sqlx::query_as::<_, Book>(
            r#"
            INSERT INTO books (
                id, profile_id, format_id, font_preset_id, title, author_name,
                card_image_asset_id, position, font_size_pt, line_height_ratio,
                margin_top_um, margin_bottom_um, margin_left_um, margin_right_um,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                datetime('now'), datetime('now')
            )
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(profile_id)
        .bind(format_id)
        .bind(font_preset_id)
        .bind(title)
        .bind(author_name)
        .bind(card_image_asset_id)
        .bind(position)
        .bind(font_size_pt)
        .bind(line_height_ratio)
        .bind(margin_top_um)
        .bind(margin_bottom_um)
        .bind(margin_left_um)
        .bind(margin_right_um)
        .fetch_one(self.pool)
        .await?;

        Ok(book)
    }

    /// Lista todos os livros ativos de um perfil ordenados por posição
    pub async fn list_by_profile(&self, profile_id: &str) -> Result<Vec<Book>, AppError> {
        let books = sqlx::query_as::<_, Book>(
            r#"
            SELECT * FROM books
            WHERE profile_id = ? AND deleted_at IS NULL
            ORDER BY position ASC, id ASC
            "#,
        )
        .bind(profile_id)
        .fetch_all(self.pool)
        .await?;

        Ok(books)
    }

    /// Busca um livro por ID (apenas se não estiver com exclusão lógica)
    pub async fn find_by_id(&self, id: &str) -> Result<Option<Book>, AppError> {
        let book = sqlx::query_as::<_, Book>(
            r#"
            SELECT * FROM books
            WHERE id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        Ok(book)
    }

    /// Atualiza os metadados e configurações de página de um livro
    pub async fn update(&self, id: &str, input: &UpdateBookInput) -> Result<Book, AppError> {
        let book = sqlx::query_as::<_, Book>(
            r#"
            UPDATE books
            SET title = COALESCE(?, title),
                author_name = COALESCE(?, author_name),
                format_id = COALESCE(?, format_id),
                font_preset_id = COALESCE(?, font_preset_id),
                card_image_asset_id = COALESCE(?, card_image_asset_id),
                font_size_pt = COALESCE(?, font_size_pt),
                line_height_ratio = COALESCE(?, line_height_ratio),
                margin_top_um = COALESCE(?, margin_top_um),
                margin_bottom_um = COALESCE(?, margin_bottom_um),
                margin_left_um = COALESCE(?, margin_left_um),
                margin_right_um = COALESCE(?, margin_right_um),
                updated_at = datetime('now')
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(&input.title)
        .bind(&input.author_name)
        .bind(&input.format_id)
        .bind(&input.font_preset_id)
        .bind(&input.card_image_asset_id)
        .bind(input.font_size_pt)
        .bind(input.line_height_ratio)
        .bind(input.margin_top_um)
        .bind(input.margin_bottom_um)
        .bind(input.margin_left_um)
        .bind(input.margin_right_um)
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(book)
    }

    /// Exclusão lógica (soft delete) do livro
    pub async fn soft_delete(&self, id: &str) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE books SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL"
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }
}
