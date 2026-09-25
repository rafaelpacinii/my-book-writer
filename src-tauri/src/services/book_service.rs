use crate::domain::book::{Book, CreateBookInput, UpdateBookInput};
use crate::error::AppError;
use crate::repositories::book_repository::BookRepository;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct BookService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> BookService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    /// Cria um livro aplicando validações e gerando o UUIDv7 local
    pub async fn create_book(&self, input: CreateBookInput) -> Result<Book, AppError> {
        let title = input.title.trim();
        if title.is_empty() {
            return Err(AppError::Validation(
                "O título do livro não pode ser vazio".into(),
            ));
        }

        let author_name = input.author_name.trim();
        if author_name.is_empty() {
            return Err(AppError::Validation(
                "O nome do autor não pode ser vazio".into(),
            ));
        }

        // Instancia o repositório para interagir com o SQLite
        let repo = BookRepository::new(self.pool);

        // Calcula a próxima posição na biblioteca para esse perfil
        let next_position = repo.get_next_position(&input.profile_id).await?;

        // Gera o identificador único global (UUIDv7 é ordenado por tempo)
        let book_id = Uuid::now_v7().to_string();

        // Valores padrão de tipografia e margens caso não tenham sido informados
        let font_size_pt = input.font_size_pt.unwrap_or(11.0);
        let line_height_ratio = input.line_height_ratio.unwrap_or(1.4);
        let margin_top_um = input.margin_top_um.unwrap_or(20_000); // 20 mm
        let margin_bottom_um = input.margin_bottom_um.unwrap_or(20_000); // 20 mm
        let margin_left_um = input.margin_left_um.unwrap_or(20_000); // 20 mm
        let margin_right_um = input.margin_right_um.unwrap_or(20_000); // 20 mm

        let book = repo
            .create(
                &book_id,
                &input.profile_id,
                &input.format_id,
                &input.font_preset_id,
                title,
                author_name,
                input.synopsis.as_deref(),
                next_position,
                font_size_pt,
                line_height_ratio,
                margin_top_um,
                margin_bottom_um,
                margin_left_um,
                margin_right_um,
            )
            .await?;

        Ok(book)
    }

    /// Lista os livros ativos pertencentes a um perfil
    pub async fn list_books(&self, profile_id: &str) -> Result<Vec<Book>, AppError> {
        let repo = BookRepository::new(self.pool);
        repo.list_by_profile(profile_id).await
    }

    /// Busca um livro por ID
    pub async fn get_book_by_id(&self, id: &str) -> Result<Option<Book>, AppError> {
        let repo = BookRepository::new(self.pool);
        repo.find_by_id(id).await
    }

    /// Atualiza os dados de um livro com validações
    pub async fn update_book(
        &self,
        id: &str,
        mut input: UpdateBookInput,
    ) -> Result<Book, AppError> {
        if let Some(ref title) = input.title {
            let trimmed = title.trim();
            if trimmed.is_empty() {
                return Err(AppError::Validation(
                    "O título do livro não pode ser vazio".into(),
                ));
            }
            input.title = Some(trimmed.to_string());
        }

        if let Some(ref author) = input.author_name {
            let trimmed = author.trim();
            if trimmed.is_empty() {
                return Err(AppError::Validation(
                    "O nome do autor não pode ser vazio".into(),
                ));
            }
            input.author_name = Some(trimmed.to_string());
        }

        if let Some(font_size) = input.font_size_pt {
            if font_size <= 0.0 {
                return Err(AppError::Validation(
                    "O tamanho da fonte deve ser maior que zero".into(),
                ));
            }
        }

        let repo = BookRepository::new(self.pool);
        repo.update(id, &input).await
    }

    /// Executa a exclusão lógica do livro
    pub async fn delete_book(&self, id: &str) -> Result<(), AppError> {
        let repo = BookRepository::new(self.pool);
        repo.soft_delete(id).await
    }
}
