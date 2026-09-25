use crate::domain::book::{Book, CreateBookInput, UpdateBookInput};
use crate::services::book_service::BookService;
use crate::state::AppState;
use tauri::State;

/// Cria um novo livro na biblioteca local.
/// Invocado pelo frontend: invoke('create_book', { input: { ... } })
#[tauri::command]
pub async fn create_book(
    state: State<'_, AppState>,
    input: CreateBookInput,
) -> Result<Book, String> {
    let service = BookService::new(&state.db_pool);
    service.create_book(input).await.map_err(|e| e.to_string())
}

/// Lista todos os livros ativos de um perfil local.
/// Invocado pelo frontend: invoke('list_books', { profileId: "..." })
#[tauri::command]
pub async fn list_books(
    state: State<'_, AppState>,
    profile_id: String,
) -> Result<Vec<Book>, String> {
    let service = BookService::new(&state.db_pool);
    service
        .list_books(&profile_id)
        .await
        .map_err(|e| e.to_string())
}

/// Busca um livro específico pelo seu identificador único (UUID).
/// Invocado pelo frontend: invoke('get_book_by_id', { id: "..." })
#[tauri::command]
pub async fn get_book_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<Book>, String> {
    let service = BookService::new(&state.db_pool);
    service.get_book_by_id(&id).await.map_err(|e| e.to_string())
}

/// Atualiza as configurações e metadados de um livro
/// Invocado pelo frontend: invoke('update_book', { id: "...", input: { ... } })
#[tauri::command]
pub async fn update_book(
    state: State<'_, AppState>,
    id: String,
    input: UpdateBookInput,
) -> Result<Book, String> {
    let service = BookService::new(&state.db_pool);
    service
        .update_book(&id, input)
        .await
        .map_err(|e| e.to_string())
}

/// Exclui um livro da biblioteca (soft delete)
/// Invocado pelo frontend: invoke('delete_book', { id: "..." })
#[tauri::command]
pub async fn delete_book(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let service = BookService::new(&state.db_pool);
    service.delete_book(&id).await.map_err(|e| e.to_string())
}
