import type { Page } from "@playwright/test";
import { book, chapter } from "@/tests/fixtures/book";

export const exportURL = `/books/export?bookId=${book.id}`;

export interface ExportRuntime {
  exportCalls: string[];
  exportIssue: boolean;
  exportMode: string;
  exportLoads: number;
}

export async function mockExportDesktop(page: Page, mode = "success") {
  await page.addInitScript(({ book, chapter, mode }) => {
    const runtime = window as unknown as ExportRuntime & {
      isTauri: boolean;
      __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
    };
    Object.assign(runtime, { isTauri: true, exportCalls: [], exportIssue: mode === "empty-chapter", exportMode: mode, exportLoads: 0 });
    runtime.__TAURI_INTERNALS__ = { invoke: async (command, args) => {
      if (command === "get_profile") return { id: book.profile_id, display_name: "Autora", avatar_asset_id: null };
      if (command === "list_books") return [book];
      if (command === "get_book_by_id") return book;
      if (command === "list_chapters") return [chapter];
      if (command === "get_pdf_export_info") {
        runtime.exportLoads += 1;
        if (runtime.exportMode === "load-error") throw "Não foi possível ler os dados do livro para exportação.";
        if (runtime.exportMode === "slow-load") await new Promise((resolve) => setTimeout(resolve, args?.bookId === book.id ? 700 : 20));
        return { title: args?.bookId === "other" ? "Outro livro" : book.title, author: book.author_name,
          format_name: "14 × 21 cm", font_name: "Merriweather", chapter_count: 1,
          available: runtime.exportMode !== "missing-chromium", desktop_available: true,
          unavailable_reason: runtime.exportMode === "missing-chromium" ? "O Chromium local não está disponível." : null,
          issues: runtime.exportIssue ? [{ code: "chapter_content", message: "O capítulo 1 “O começo da história” está vazio. Escreva e salve o texto ou remova o capítulo antes de exportar.", chapter_id: chapter.id, formats: ["pdf", "epub", "docx"] }] : [],
        };
      }
      if (command.startsWith("export_book_")) {
        runtime.exportCalls.push(command);
        await new Promise((resolve) => setTimeout(resolve, runtime.exportMode === "slow" ? 900 : 80));
        if (runtime.exportMode === "error") throw { message: "A pasta escolhida não está disponível." };
        if (runtime.exportMode === "unknown-error") throw { internal: 42 };
        if (runtime.exportMode === "cancel") return null;
        return { path: `/livros/Livro.${command.slice("export_book_".length)}`,
          warning: runtime.exportMode === "metadata-error" ? "O arquivo foi salvo, mas não foi possível atualizar a data de acesso ao livro." : null };
      }
      throw new Error(`Unexpected native command: ${command}`);
    } };
  }, { book, chapter, mode });
}
