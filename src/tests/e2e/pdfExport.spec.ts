import { test, expect } from "./fixtures";
import { book, chapter } from "@/tests/fixtures/book";

const exportURL = `/books/export?bookId=${book.id}`;

async function mockDesktop(page: import("@playwright/test").Page, mode: string) {
  await page.addInitScript(({ book, chapter, mode }) => {
    const runtime = window as unknown as {
      isTauri: boolean;
      __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
      pdfExportCalls: number;
      pdfSaveCalls: number;
    };
    runtime.isTauri = true;
    runtime.pdfExportCalls = 0;
    runtime.pdfSaveCalls = 0;
    let currentChapter = chapter;
    runtime.__TAURI_INTERNALS__ = {
      invoke: async (command, args) => {
        switch (command) {
          case "get_profile": return { id: book.profile_id, display_name: "Autora", avatar_asset_id: null };
          case "list_books": return [book];
          case "get_book_by_id": return book;
          case "list_chapters": return [currentChapter];
          case "get_chapter_by_id": return currentChapter;
          case "list_book_formats": return [{ id: book.format_id, name: "14 × 21 cm", width_um: 140000, height_um: 210000, market: "BR", is_active: true }];
          case "list_font_presets": return [{ id: book.font_preset_id, name: "Merriweather", family_name: "Merriweather", manifest_path: "", is_active: true }];
          case "update_chapter_title": {
            currentChapter = { ...currentChapter, title: String(args?.title) };
            return currentChapter;
          }
          case "save_chapter_content": {
            runtime.pdfSaveCalls += 1;
            if (mode === "delayed-save") await new Promise((resolve) => setTimeout(resolve, 500));
            if (mode === "save-error") throw new Error("Falha ao salvar");
            if (args?.expectedRevision !== currentChapter.content_revision) throw new Error("Conflito de revisão");
            currentChapter = { ...currentChapter, content_json: String(args?.contentJson), content_revision: currentChapter.content_revision + 1 };
            localStorage.setItem("pdf_saved_chapter", currentChapter.content_json);
            return currentChapter;
          }
          case "get_pdf_export_info": return {
            title: book.title, author: book.author_name, format_name: "14 × 21 cm", font_name: "Merriweather",
            chapter_count: mode === "empty" ? 0 : 1, available: mode !== "missing",
            unavailable_reason: mode === "missing" ? "O Chromium local não está disponível." : null,
          };
          case "export_book_pdf": {
            runtime.pdfExportCalls += 1;
            await new Promise((resolve) => setTimeout(resolve, 250));
            if (mode === "error") throw new Error("Não foi possível salvar o PDF na pasta escolhida.");
            return mode === "cancel" ? null : { path: "/livros/Meu livro.pdf" };
          }
          default: throw new Error(`Unexpected native command: ${command}`);
        }
      },
    };
  }, { book, chapter, mode });
}

test("book menu opens the export route and browser development explains desktop availability", async ({ page }) => {
  await page.goto(`/books/view?bookId=${book.id}`);
  await page.getByRole("link", { name: "Exportar", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(exportURL.replace("?", "\\?")));
  await expect(page.getByRole("heading", { name: "Exportar livro" })).toBeVisible();
  await expect(page.getByText("A exportação PDF está disponível no aplicativo desktop.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeDisabled();
});

test("desktop export reports the saved file and prevents duplicate operations", async ({ page }) => {
  await mockDesktop(page, "success");
  await page.goto(exportURL);
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await expect(page.getByRole("button", { name: "Gerando PDF…" })).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("PDF salvo em: /livros/Meu livro.pdf");
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeEnabled();
  expect(await page.evaluate(() => (window as unknown as { pdfExportCalls: number }).pdfExportCalls)).toBe(1);
});

test("canceling the native save dialog is not reported as success or failure", async ({ page }) => {
  await mockDesktop(page, "cancel");
  await page.goto(exportURL);
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeEnabled();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(page.getByText("PDF salvo em:")).toHaveCount(0);
});

test("native errors are visible and allow a retry", async ({ page }) => {
  await mockDesktop(page, "error");
  await page.goto(exportURL);
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível salvar o PDF");
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeEnabled();
});

for (const mode of ["empty", "missing"]) {
  test(`export is disabled when ${mode}`, async ({ page }) => {
    await mockDesktop(page, mode);
    await page.goto(exportURL);
    await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeDisabled();
    await expect(page.getByText(mode === "empty" ? "Adicione pelo menos um capítulo antes de exportar." : "O Chromium local não está disponível.")).toBeVisible();
  });
}

test("export from the editor saves the most recent text before navigating", async ({ page }) => {
  await mockDesktop(page, "success");
  await page.goto(`/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
  const editor = page.locator("[contenteditable=true]");
  await expect(editor).toBeVisible();
  await editor.fill("Texto escrito imediatamente antes da exportação.");
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  await expect(page).toHaveURL(new RegExp("/books/export\\?"));
  const saved = await page.evaluate(() => localStorage.getItem("pdf_saved_chapter"));
  expect(saved).toContain("Texto escrito imediatamente antes da exportação.");
});

test("export stays in the editor if saving fails", async ({ page }) => {
  await mockDesktop(page, "save-error");
  await page.goto(`/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
  await page.locator("[contenteditable=true]").fill("Alteração pendente.");
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  await expect(page.getByText("Erro ao salvar")).toBeVisible();
  await expect(page).toHaveURL(new RegExp("/books/editor\\?"));
});

test("export includes edits made while an earlier save is still running", async ({ page }) => {
  await mockDesktop(page, "delayed-save");
  await page.goto(`/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
  const editor = page.locator("[contenteditable=true]");
  await editor.fill("Primeira versão do texto.");
  await page.keyboard.press("Control+s");
  await expect.poll(() => page.evaluate(() => (window as unknown as { pdfSaveCalls: number }).pdfSaveCalls)).toBe(1);
  await editor.fill("Versão mais recente escrita durante o salvamento.");
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  await expect(page).toHaveURL(new RegExp("/books/export\\?"));
  const saved = await page.evaluate(() => localStorage.getItem("pdf_saved_chapter"));
  expect(saved).toContain("Versão mais recente escrita durante o salvamento.");
  expect(saved).not.toContain("Primeira versão do texto.");
});
