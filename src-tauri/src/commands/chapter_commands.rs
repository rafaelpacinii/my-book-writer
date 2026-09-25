use crate::domain::chapter::{Chapter, ChapterSummary, CreateChapterInput};
use crate::services::chapter_service::ChapterService;
use crate::state::AppState;
use tauri::State;

/// Cria um novo capítulo no livro
#[tauri::command]
pub async fn create_chapter(
    state: State<'_, AppState>,
    input: CreateChapterInput,
) -> Result<Chapter, String> {
    let service = ChapterService::new(&state.db_pool);
    service
        .create_chapter(input)
        .await
        .map_err(|e| e.to_string())
}

/// Lista o sumário dos capítulos ativos de um livro
#[tauri::command]
pub async fn list_chapters(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<ChapterSummary>, String> {
    let service = ChapterService::new(&state.db_pool);
    service
        .list_chapters(&book_id)
        .await
        .map_err(|e| e.to_string())
}

/// Carrega um capítulo completo com todo o conteúdo JSON
#[tauri::command]
pub async fn get_chapter_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<Chapter>, String> {
    let service = ChapterService::new(&state.db_pool);
    service
        .get_chapter_by_id(&id)
        .await
        .map_err(|e| e.to_string())
}

/// Atualiza o título de um capítulo
#[tauri::command]
pub async fn update_chapter_title(
    state: State<'_, AppState>,
    id: String,
    title: String,
) -> Result<Chapter, String> {
    let service = ChapterService::new(&state.db_pool);
    service
        .update_chapter_title(&id, &title)
        .await
        .map_err(|e| e.to_string())
}

/// Salva o conteúdo do editor com controle de concorrência otimista
#[tauri::command]
pub async fn save_chapter_content(
    state: State<'_, AppState>,
    id: String,
    expected_revision: i64,
    content_json: String,
) -> Result<Chapter, String> {
    let service = ChapterService::new(&state.db_pool);
    service
        .save_chapter_content(&id, expected_revision, &content_json)
        .await
        .map_err(|e| e.to_string())
}

/// Reordena os capítulos de um livro em transação atômica
#[tauri::command]
pub async fn reorder_chapters(
    state: State<'_, AppState>,
    book_id: String,
    chapter_ids: Vec<String>,
) -> Result<(), String> {
    let service = ChapterService::new(&state.db_pool);
    service
        .reorder_chapters(&book_id, &chapter_ids)
        .await
        .map_err(|e| e.to_string())
}

/// Exclusão lógica (soft delete) de um capítulo
#[tauri::command]
pub async fn delete_chapter(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let service = ChapterService::new(&state.db_pool);
    service.delete_chapter(&id).await.map_err(|e| e.to_string())
}
