use crate::domain::backup::{BackupExportResult, BackupImportResult, DatabaseStats};
use crate::error::AppError;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

pub struct BackupService<'a> {
    pool: &'a SqlitePool,
    storage_dir: &'a Path,
}

impl<'a> BackupService<'a> {
    pub fn new(pool: &'a SqlitePool, storage_dir: &'a Path) -> Self {
        Self { pool, storage_dir }
    }

    pub fn get_db_path(&self) -> PathBuf {
        self.storage_dir.join("my_book_writer.db")
    }

    /// Retorna métricas e estatísticas do banco de dados SQLite
    pub async fn get_database_stats(&self) -> Result<DatabaseStats, AppError> {
        let db_path = self.get_db_path();
        let file_size_bytes = fs::metadata(&db_path).map(|m| m.len()).unwrap_or(0);

        let books_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM books WHERE deleted_at IS NULL")
                .fetch_one(self.pool)
                .await
                .unwrap_or(0);

        let chapters_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM chapters WHERE deleted_at IS NULL")
                .fetch_one(self.pool)
                .await
                .unwrap_or(0);

        let versions_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM chapter_versions")
            .fetch_one(self.pool)
            .await
            .unwrap_or(0);

        Ok(DatabaseStats {
            db_path: db_path.to_string_lossy().to_string(),
            file_size_bytes,
            books_count,
            chapters_count,
            versions_count,
        })
    }

    /// Exporta uma cópia limpa do banco de dados SQLite
    pub async fn export_backup(
        &self,
        app: &AppHandle,
        custom_path: Option<String>,
    ) -> Result<Option<BackupExportResult>, AppError> {
        let db_path = self.get_db_path();
        if !db_path.exists() {
            return Err(AppError::Validation(
                "Arquivo de banco de dados não encontrado.".into(),
            ));
        }

        // 1. Descarrega e sincroniza o WAL para garantir consistência
        let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);")
            .execute(self.pool)
            .await;

        // 2. Determina o destino (customizado ou diálogo nativo)
        let destination_path = match custom_path {
            Some(path) => PathBuf::from(path),
            None => {
                let app_handle = app.clone();
                let now = chrono_free_timestamp();
                let filename = format!("my_book_writer_backup_{}.sqlite", now);

                let chosen = tauri::async_runtime::spawn_blocking(move || {
                    app_handle
                        .dialog()
                        .file()
                        .set_title("Exportar backup do banco de dados")
                        .add_filter("Banco de Dados SQLite (.sqlite, .db)", &["sqlite", "db"])
                        .set_file_name(filename)
                        .blocking_save_file()
                })
                .await
                .map_err(|e| AppError::Validation(format!("Falha no diálogo: {}", e)))?;

                match chosen {
                    Some(c) => c.into_path().map_err(|e| {
                        AppError::Validation(format!("Caminho de destino inválido: {}", e))
                    })?,
                    None => return Ok(None),
                }
            }
        };

        // 3. Copia o arquivo SQLite
        fs::copy(&db_path, &destination_path).map_err(|e| {
            AppError::Validation(format!("Falha ao copiar arquivo de backup: {}", e))
        })?;

        let file_size_bytes = fs::metadata(&destination_path)
            .map(|m| m.len())
            .unwrap_or(0);

        Ok(Some(BackupExportResult {
            destination_path: destination_path.to_string_lossy().to_string(),
            file_size_bytes,
        }))
    }

    /// Importa e restaura um banco de dados SQLite validando sua integridade
    pub async fn import_backup(
        &self,
        app: &AppHandle,
        custom_path: Option<String>,
    ) -> Result<Option<BackupImportResult>, AppError> {
        let db_path = self.get_db_path();

        // 1. Seleciona o arquivo de origem (customizado ou diálogo nativo)
        let source_path = match custom_path {
            Some(path) => PathBuf::from(path),
            None => {
                let app_handle = app.clone();
                let chosen = tauri::async_runtime::spawn_blocking(move || {
                    app_handle
                        .dialog()
                        .file()
                        .set_title("Selecionar arquivo de backup para restaurar")
                        .add_filter("Banco de Dados SQLite (.sqlite, .db)", &["sqlite", "db"])
                        .blocking_pick_file()
                })
                .await
                .map_err(|e| AppError::Validation(format!("Falha no diálogo: {}", e)))?;

                match chosen {
                    Some(c) => c.into_path().map_err(|e| {
                        AppError::Validation(format!("Caminho selecionado inválido: {}", e))
                    })?,
                    None => return Ok(None),
                }
            }
        };

        // 2. Valida o cabeçalho do arquivo SQLite
        validate_sqlite_file(&source_path).await?;

        // 3. Backup de emergência do banco atual antes de substituir
        if db_path.exists() {
            let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);")
                .execute(self.pool)
                .await;

            let backup_path = self.storage_dir.join("my_book_writer.db.pre_restore_bak");
            let _ = fs::copy(&db_path, backup_path);
        }

        // 4. Substitui o arquivo do banco de dados
        fs::copy(&source_path, &db_path).map_err(|e| {
            AppError::Validation(format!("Falha ao restaurar banco de dados: {}", e))
        })?;

        // 5. Remove arquivos WAL/SHM residuais da sessão anterior
        let _ = fs::remove_file(self.storage_dir.join("my_book_writer.db-wal"));
        let _ = fs::remove_file(self.storage_dir.join("my_book_writer.db-shm"));

        // 6. Aplica migrações para garantir compatibilidade de esquema
        sqlx::migrate!("./migrations")
            .run(self.pool)
            .await
            .map_err(|e| {
                AppError::Validation(format!(
                    "Falha ao aplicar migrações após restauração: {}",
                    e
                ))
            })?;

        // 7. Lê estatísticas restauradas
        let books_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM books WHERE deleted_at IS NULL")
                .fetch_one(self.pool)
                .await
                .unwrap_or(0);

        let chapters_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM chapters WHERE deleted_at IS NULL")
                .fetch_one(self.pool)
                .await
                .unwrap_or(0);

        Ok(Some(BackupImportResult {
            books_count,
            chapters_count,
        }))
    }
}

/// Valida magic bytes e integridade básica do arquivo SQLite
async fn validate_sqlite_file(path: &Path) -> Result<(), AppError> {
    if !path.exists() {
        return Err(AppError::Validation(
            "O arquivo selecionado não existe.".into(),
        ));
    }

    let metadata = fs::metadata(path)
        .map_err(|e| AppError::Validation(format!("Não foi possível ler o arquivo: {}", e)))?;

    if metadata.len() < 100 {
        return Err(AppError::Validation(
            "O arquivo fornecido é muito pequeno para ser um banco de dados SQLite válido.".into(),
        ));
    }

    let header_bytes = fs::read(path)
        .map_err(|e| AppError::Validation(format!("Erro ao ler cabeçalho do arquivo: {}", e)))?;

    const SQLITE_MAGIC_HEADER: &[u8; 16] = b"SQLite format 3\0";
    if header_bytes.len() < 16 || &header_bytes[0..16] != SQLITE_MAGIC_HEADER {
        return Err(AppError::Validation(
            "O arquivo selecionado não é um banco de dados SQLite válido.".into(),
        ));
    }

    // Tenta abrir temporariamente para verificar integridade
    let options = SqliteConnectOptions::new().filename(path).read_only(true);

    let temp_pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(options)
        .await
        .map_err(|e| {
            AppError::Validation(format!("Falha ao conectar ao banco de backup: {}", e))
        })?;

    let integrity: Result<String, _> = sqlx::query_scalar("PRAGMA quick_check(1);")
        .fetch_one(&temp_pool)
        .await;

    temp_pool.close().await;

    match integrity {
        Ok(ref status) if status == "ok" => Ok(()),
        Ok(other) => Err(AppError::Validation(format!(
            "O arquivo de backup apresentou falha de integridade: {}",
            other
        ))),
        Err(e) => Err(AppError::Validation(format!(
            "Erro ao validar integridade do backup: {}",
            e
        ))),
    }
}

fn chrono_free_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    now.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;
    use tempfile::tempdir;

    #[test]
    fn test_validate_sqlite_rejects_invalid_file() {
        tauri::async_runtime::block_on(async {
            let dir = tempdir().unwrap();
            let file_path = dir.path().join("fake.sqlite");
            fs::write(&file_path, b"not a sqlite file content here at all").unwrap();

            let result = validate_sqlite_file(&file_path).await;
            assert!(result.is_err());
        });
    }

    #[test]
    fn test_get_database_stats() {
        tauri::async_runtime::block_on(async {
            let dir = tempdir().unwrap();
            let db_path = dir.path().join("my_book_writer.db");

            let pool = SqlitePoolOptions::new()
                .connect(&format!("sqlite://{}?mode=rwc", db_path.display()))
                .await
                .unwrap();

            sqlx::migrate!("./migrations").run(&pool).await.unwrap();

            let service = BackupService::new(&pool, dir.path());
            let stats = service.get_database_stats().await.unwrap();

            assert_eq!(stats.books_count, 0);
            assert_eq!(stats.chapters_count, 0);
            assert!(stats.file_size_bytes > 0);
        });
    }
}
