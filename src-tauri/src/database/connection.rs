use crate::error::AppError;
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::fs;
use tauri::{AppHandle, Manager};

pub async fn init_pool(app: &AppHandle) -> Result<SqlitePool, AppError> {
    // 1. Obtém o diretório seguro de dados da aplicação no sistema operacional
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::Validation(format!("Falha ao obter diretório do app: {}", e)))?;

    // Garante que a pasta existe no disco
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| AppError::Validation(format!("Falha ao criar diretório do app: {}", e)))?;
    }

    let db_path = app_dir.join("my_book_writer.db");

    // 2. Configurações avançadas da conexão SQLite
    let connect_options = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .foreign_keys(true);

    // 3. Inicializa o pool com até 5 conexões concorrentes
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await?;

    // 4. Aplica automaticamente as migrações da pasta `migrations/`
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|e| AppError::Validation(format!("Falha ao executar migrações: {}", e)))?;

    Ok(pool)
}
