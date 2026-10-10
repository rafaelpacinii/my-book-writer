use crate::domain::front_matter::{BookFrontMatter, SaveFrontMatterInput};
use crate::error::AppError;
use crate::repositories::book_repository::{touch_book, BookRepository};
use crate::repositories::front_matter_repository::FrontMatterRepository;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_book_front_matter(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<BookFrontMatter, String> {
    let repo = FrontMatterRepository::new(&state.db_pool);

    if let Some(fm) = repo
        .get_by_book_id(&book_id)
        .await
        .map_err(|e| e.to_string())?
    {
        return Ok(fm);
    }

    // Se ainda não foi customizado, gera padrões inteligentes baseados no livro
    let book_repo = BookRepository::new(&state.db_pool);
    let book = book_repo
        .find_by_id(&book_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Livro não encontrado".to_string())?;

    let current_year = 2026; // ano atual do app
    let copyright_text = format!(
        "© {} {}. Todos os direitos reservados. Nenhuma parte desta obra pode ser reproduzida sem autorização.",
        current_year, book.author_name
    );

    Ok(BookFrontMatter {
        book_id: book.id,
        include_half_title: true,
        include_title_page: true,
        subtitle: None,
        publisher: None,
        edition: "1ª edição".to_string(),
        publication_year: Some(current_year),
        publication_city: None,
        include_copyright_page: true,
        copyright_text: Some(copyright_text),
        isbn_print: None,
        isbn_digital: None,
        cover_designer: None,
        proofreader: None,
        layout_designer: Some("My Book Writer".to_string()),
        cataloging_data: None,
        include_dedication: false,
        dedication_text: None,
        include_epigraph: false,
        epigraph_text: None,
        epigraph_author: None,
        include_table_of_contents: true,
        created_at: String::new(),
        updated_at: String::new(),
    })
}

#[tauri::command]
pub async fn save_book_front_matter(
    state: State<'_, AppState>,
    input: SaveFrontMatterInput,
) -> Result<BookFrontMatter, String> {
    let repo = FrontMatterRepository::new(&state.db_pool);
    let saved = repo.upsert(&input).await.map_err(|e| e.to_string())?;

    touch_book(&state.db_pool, &input.book_id)
        .await
        .map_err(|e: AppError| e.to_string())?;

    Ok(saved)
}
