pub mod app_state;

// Re-exporta AppState para que possamos importar diretamente com `use crate::state::AppState;`
pub use app_state::AppState;
