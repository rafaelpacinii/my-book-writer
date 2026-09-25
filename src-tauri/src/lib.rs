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
            // Livros (CRUD Completo)
            commands::book_commands::create_book,
            commands::book_commands::list_books,
            commands::book_commands::get_book_by_id,
            commands::book_commands::update_book,
            commands::book_commands::delete_book,
            // Perfil
            commands::profile_commands::get_profile,
            commands::profile_commands::update_profile,
            // Catálogos
            commands::catalog_commands::list_book_formats,
            commands::catalog_commands::list_font_presets,
            // Capítulos
            commands::chapter_commands::create_chapter,
            commands::chapter_commands::list_chapters,
            commands::chapter_commands::get_chapter_by_id,
            commands::chapter_commands::update_chapter_title,
            commands::chapter_commands::save_chapter_content,
            commands::chapter_commands::reorder_chapters,
            commands::chapter_commands::delete_chapter,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao executar aplicação Tauri");
}
