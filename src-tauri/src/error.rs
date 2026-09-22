use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Erro de validação: {0}")]
    Validation(String),

    #[error("Erro no banco de dados: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Recurso não encontrado: {0}")]
    NotFound(String),
}
