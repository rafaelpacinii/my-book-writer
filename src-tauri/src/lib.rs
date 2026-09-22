pub mod commands;
pub mod database;
pub mod domain;
pub mod error;
pub mod repositories;
pub mod services;
pub mod state;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();

            // Bloqueia a thread principal temporariamente no startup para garantir
            // que o banco e as migrações estejam 100% prontos antes de abrir a UI
            tauri::async_runtime::block_on(async move {
                let pool = database::init_pool(&handle)
                    .await
                    .expect("Falha ao inicializar o banco de dados");

                app.manage(state::AppState { db_pool: pool });
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::book_commands::create_book,
            commands::book_commands::list_books,
            commands::book_commands::get_book_by_id,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao executar aplicação Tauri");
}
