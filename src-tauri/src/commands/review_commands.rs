use crate::domain::review::{CreateCommentInput, MarkProgressInput, ReviewComment, ReviewProgress};
use crate::services::review_service::ReviewService;
use crate::state::AppState;
use tauri::State;

/// Cria um comentário de revisão ancorado em um trecho do capítulo
#[tauri::command]
pub async fn create_review_comment(
    state: State<'_, AppState>,
    input: CreateCommentInput,
) -> Result<ReviewComment, String> {
    let service = ReviewService::new(&state.db_pool);
    service
        .create_comment(input)
        .await
        .map_err(|e| e.to_string())
}

/// Lista todos os comentários de um capítulo
#[tauri::command]
pub async fn list_review_comments(
    state: State<'_, AppState>,
    chapter_id: String,
) -> Result<Vec<ReviewComment>, String> {
    let service = ReviewService::new(&state.db_pool);
    service
        .list_comments(&chapter_id)
        .await
        .map_err(|e| e.to_string())
}

/// Marca um comentário como resolvido
#[tauri::command]
pub async fn resolve_review_comment(
    state: State<'_, AppState>,
    id: String,
) -> Result<ReviewComment, String> {
    let service = ReviewService::new(&state.db_pool);
    service
        .resolve_comment(&id)
        .await
        .map_err(|e| e.to_string())
}

/// Reabre um comentário previamente resolvido
#[tauri::command]
pub async fn reopen_review_comment(
    state: State<'_, AppState>,
    id: String,
) -> Result<ReviewComment, String> {
    let service = ReviewService::new(&state.db_pool);
    service.reopen_comment(&id).await.map_err(|e| e.to_string())
}

/// Obtém a marcação de progresso de revisão de um capítulo
#[tauri::command]
pub async fn get_review_progress(
    state: State<'_, AppState>,
    chapter_id: String,
) -> Result<Option<ReviewProgress>, String> {
    let service = ReviewService::new(&state.db_pool);
    service
        .get_progress(&chapter_id)
        .await
        .map_err(|e| e.to_string())
}

/// Salva ou atualiza o progresso de revisão de um capítulo
#[tauri::command]
pub async fn mark_review_progress(
    state: State<'_, AppState>,
    input: MarkProgressInput,
) -> Result<ReviewProgress, String> {
    let service = ReviewService::new(&state.db_pool);
    service
        .mark_progress(input)
        .await
        .map_err(|e| e.to_string())
}
