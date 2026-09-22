pub mod connection;

// Re-exporta init_pool para importar direto como `use crate::database::init_pool;`
pub use connection::init_pool;
