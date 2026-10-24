import type { Page } from "@playwright/test";
import { book, format, font } from "@/tests/fixtures/book";
import type { Book } from "@/types/book";

export async function mockUI(page: Page, options: { delay?: number; failBooks?: number; cover?: string; empty?: boolean; failCover?: number; books?: Book[] } = {}) {
  await page.addInitScript(({ book, format, font, options }) => {
    const runtime = window as unknown as {
      __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
      uiCalls: Record<string, number>;
      uiFailBooks: number;
      uiFailCover: number;
      uiCover: string | undefined;
      uiBooks: typeof book[];
    };
    runtime.uiCalls = {};
    let profile = { id: book.profile_id, display_name: "Helena Duarte" };
    runtime.uiFailCover = options.failCover ?? 0;
    runtime.uiCover = options.cover;
    runtime.uiFailBooks = options.failBooks ?? 0;
    runtime.uiBooks = options.books ?? (options.empty ? [] : [{ ...book, card_image_asset_id: options.cover ? "cover-1" : null }]);
    runtime.__TAURI_INTERNALS__ = {
      invoke: async (command, args) => {
        runtime.uiCalls[command] = (runtime.uiCalls[command] ?? 0) + 1;
        if (options.delay) await new Promise((resolve) => setTimeout(resolve, options.delay));
        switch (command) {
          case "get_profile": return profile;
          case "update_profile":
            profile = { ...profile, display_name: String(args?.displayName) };
            return profile;
          case "list_books":
            if (runtime.uiFailBooks-- > 0) throw new Error("Não foi possível carregar seus livros.");
            return runtime.uiBooks;
          case "get_book_by_id": return runtime.uiBooks.find((item) => item.id === args?.id) ?? null;
          case "list_book_formats": return [{ ...format, id: book.format_id }];
          case "list_font_presets": return [{ ...font, id: book.font_preset_id }];
          case "get_database_stats": return {
            db_path: "C:/ui-tests/books.sqlite", file_size_bytes: 1024,
            books_count: runtime.uiBooks.length, chapters_count: 1, versions_count: 0,
          };
          case "list_image_assets": return [{ id: runtime.uiBooks.find((item) => item.id === args?.bookId)?.card_image_asset_id, storage_key: "covers/test.png" }];
          case "read_image_data_url": return runtime.uiCover;
          case "import_image_asset": {
            if (runtime.uiFailCover-- > 0) throw new Error("Não foi possível salvar a imagem.");
            runtime.uiCover = (args?.input as { data_base64: string }).data_base64;
            return { id: "cover-new", storage_key: "covers/new.png" };
          }
          case "set_book_card_image":
            runtime.uiBooks = runtime.uiBooks.map((item) => item.id === args?.bookId
              ? { ...item, card_image_asset_id: args.assetId as string | null } : item);
            return;
          case "update_book": {
            const updated = { ...runtime.uiBooks.find((item) => item.id === args?.id)!, ...args?.input as object };
            runtime.uiBooks = runtime.uiBooks.map((item) => item.id === updated.id ? updated : item);
            return updated;
          }
          case "create_book": {
            const created = { ...book, ...args?.input as object, id: "new-ui-book", updated_at: "2026-10-22" };
            runtime.uiBooks = [...runtime.uiBooks, created];
            return created;
          }
          case "import_database_backup":
            runtime.uiBooks = [{ ...book, title: "Livro restaurado" }];
            return { books_count: 1, chapters_count: 0, versions_count: 0 };
          case "export_database_backup": return null;
          default: throw new Error(`Comando inesperado no teste: ${command}`);
        }
      },
    };
  }, { book, format, font, options });
}
