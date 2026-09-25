use crate::domain::image_asset::{ImageAsset, ImportImageInput};
use crate::services::image_asset_service::ImageAssetService;
use crate::state::AppState;
use tauri::State;

/// Importa uma imagem para o livro (salva em disco e registra metadados)
#[tauri::command]
pub async fn import_image_asset(
    state: State<'_, AppState>,
    input: ImportImageInput,
) -> Result<ImageAsset, String> {
    let service = ImageAssetService::new(&state.db_pool, &state.storage_dir);
    service.import_image(input).await.map_err(|e| e.to_string())
}

/// Lista todas as imagens pertencentes a um livro
#[tauri::command]
pub async fn list_image_assets(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<ImageAsset>, String> {
    let service = ImageAssetService::new(&state.db_pool, &state.storage_dir);
    service
        .list_images(&book_id)
        .await
        .map_err(|e| e.to_string())
}

/// Define a imagem de capa/card do livro (ou remove se asset_id for None)
#[tauri::command]
pub async fn set_book_card_image(
    state: State<'_, AppState>,
    book_id: String,
    asset_id: Option<String>,
) -> Result<(), String> {
    let service = ImageAssetService::new(&state.db_pool, &state.storage_dir);
    service
        .set_card_image(&book_id, asset_id.as_deref())
        .await
        .map_err(|e| e.to_string())
}

/// Retorna o caminho absoluto do arquivo no disco do computador
#[tauri::command]
pub async fn get_image_file_path(
    state: State<'_, AppState>,
    storage_key: String,
) -> Result<String, String> {
    let service = ImageAssetService::new(&state.db_pool, &state.storage_dir);
    let path = service.get_absolute_path(&storage_key);
    Ok(path.to_string_lossy().to_string())
}
