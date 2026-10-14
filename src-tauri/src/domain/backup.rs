use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseStats {
    pub db_path: String,
    pub file_size_bytes: u64,
    pub books_count: i64,
    pub chapters_count: i64,
    pub versions_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupExportResult {
    pub destination_path: String,
    pub file_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupImportResult {
    pub books_count: i64,
    pub chapters_count: i64,
}
