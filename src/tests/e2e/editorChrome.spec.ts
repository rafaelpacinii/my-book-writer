import { test, expect } from "./fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import { editorURL, readSavedHtml, readSavedBook } from "./pagedEditor";

test("one editor header exposes text tools and a single layout action, while the footer owns save state and view mode", async ({ page }) => {
  await page.goto(editorURL);
  const header = page.getByRole("region", { name: "Editor do livro" });
  const footer = page.getByRole("region", { name: "Status do editor" });
  await expect(page.locator("main header")).toHaveCount(1);
  await expect(header.getByRole("button", { name: "Diagramação", exact: true })).toHaveCount(1);
  await expect(header.getByRole("combobox")).toHaveCount(0);
  await expect(header.getByText("Parágrafo", { exact: true })).toHaveCount(0);
  await expect(header.getByRole("status")).toHaveCount(0);
  await expect(footer.getByRole("status")).toHaveText("Salvo neste dispositivo");
  await footer.getByRole("button", { name: "Paginado", exact: true }).click();
  await expect(page.locator("[data-paged-paper]")).toBeVisible();
  await expect(footer.getByRole("button", { name: "Paginado", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect((await header.boundingBox())!.height).toBeLessThan(100);
});

test("the insertion menu preserves the text caret and Escape returns focus to its trigger", async ({ page }) => {
  await page.goto(editorURL);
  const editor = page.locator('[contenteditable="true"]');
  await editor.fill("ABC");
  await editor.press("Home");
  await editor.press("ArrowRight");
  await page.getByText("Inserir", { exact: true }).click();
  await page.getByRole("button", { name: "Travessão de diálogo", exact: true }).click();
  await expect(editor).toHaveText("A— BC");
  await expect.poll(() => readSavedHtml(page)).toContain("A— BC");
  await page.getByText("Inserir", { exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Inserir", { exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Quebra de cena", exact: true })).toBeHidden();
});

test("layout failure retains the form and edits, then retry persists the book layout", async ({ page }) => {
  await page.addInitScript((book) => {
    localStorage.setItem("my_book_writer_books", JSON.stringify([{ ...book, margin_top_um: 20321 }]));
  }, book);
  await page.goto(editorURL);
  await page.getByRole("button", { name: "Diagramação", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Diagramação do livro" });
  await dialog.getByLabel("Tamanho da fonte (pt)", { exact: true }).fill("15");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let fail = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === "my_book_writer_books" && fail) { fail = false; throw new Error("Disco indisponível"); }
      original.call(this, key, value);
    };
  });
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Não foi possível salvar");
  await expect(dialog.getByLabel("Tamanho da fonte (pt)", { exact: true })).toHaveValue("15");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(dialog).toHaveCount(0);
  expect((await readSavedBook(page)).font_size_pt).toBe(15);
  expect((await readSavedBook(page)).margin_top_um).toBe(20321);
  await expect(page.getByRole("button", { name: "Diagramação", exact: true })).toBeFocused();
});

test("manual save remains discoverable when autosave is disabled", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mbw_editor_preferences", JSON.stringify({ autosaveEnabled: false })));
  await page.goto(editorURL);
  await page.locator('[contenteditable="true"]').fill("Texto salvo pelo rodapé.");
  const footer = page.getByRole("region", { name: "Status do editor" });
  await expect(footer.getByRole("status")).toHaveText("Alterações não salvas");
  await footer.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(footer.getByRole("status")).toHaveText("Salvo neste dispositivo");
  expect(await readSavedHtml(page)).toContain("Texto salvo pelo rodapé.");
});

test("save failure blocks chapter changes and remains recoverable in focus mode", async ({ page }) => {
  await page.addInitScript(({ chapter }) => {
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([chapter, { ...chapter, id: "second", title: "Segundo capítulo", position: 1 }]));
  }, { chapter });
  await page.goto(editorURL);
  await expect(page.locator('[contenteditable="true"]')).toBeVisible();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "my_book_writer_chapters") throw new Error("Disco indisponível");
      original.call(this, key, value);
    };
  });
  await page.locator('[contenteditable="true"]').fill("Rascunho preservado.");
  await page.getByRole("complementary").filter({ hasText: "Capítulos" }).getByText("Segundo capítulo", { exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Erro ao salvar");
  await expect(page).toHaveURL(new RegExp(`chapterId=${chapter.id}`));
  await expect(page.locator('[contenteditable="true"]')).toHaveText("Rascunho preservado.");
  await page.getByRole("button", { name: "Modo foco", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tentar novamente", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sair do foco", exact: true }).click();
  await page.getByRole("button", { name: "+ Novo capítulo", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Novo capítulo", exact: true });
  await dialog.getByLabel("Título do capítulo", { exact: true }).fill("Capítulo pendente");
  await dialog.getByRole("button", { name: "Criar capítulo", exact: true }).click();
  await expect(dialog.getByText("Não foi possível criar o capítulo. Verifique o salvamento e tente novamente.")).toBeVisible();
  await expect(dialog.getByLabel("Título do capítulo", { exact: true })).toHaveValue("Capítulo pendente");
});

test("review and history shortcuts open mutually exclusive panels", async ({ page }) => {
  await page.goto(editorURL);
  await expect(page.locator('[contenteditable="true"]')).toBeVisible();
  await page.keyboard.press("Control+Shift+r");
  await expect(page.getByRole("button", { name: "Fechar painel de revisão", exact: true })).toBeVisible();
  await page.keyboard.press("Control+Shift+h");
  await expect(page.getByTitle("Fechar histórico", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar painel de revisão", exact: true })).toHaveCount(0);
  await page.keyboard.press("Control+Shift+r");
  await expect(page.getByTitle("Fechar histórico", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Fechar painel de revisão", exact: true })).toBeVisible();
});

test("compact editor keeps formatting, layout and focus accessible without horizontal header scrolling", async ({ page }) => {
  for (const width of [800, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(editorURL);
    const header = page.getByRole("region", { name: "Editor do livro" });
    await expect(header.getByRole("button", { name: "Diagramação", exact: true })).toBeVisible();
    expect(await header.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.getByLabel("Mais opções do editor").click();
    await page.getByRole("button", { name: "Modo foco", exact: true }).click();
    await expect(page.locator("[data-app-sidebar]")).toBeHidden();
    await page.getByRole("button", { name: "Sair do foco", exact: true }).click();
    await expect(header.getByRole("navigation", { name: "Caminho de navegação" })).toBeVisible();
  }
});
