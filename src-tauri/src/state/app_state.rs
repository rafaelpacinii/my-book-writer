use sqlx::SqlitePool;
use std::path::PathBuf;
pub struct AppState {
    pub db_pool: SqlitePool,
    pub storage_dir: PathBuf,
}
