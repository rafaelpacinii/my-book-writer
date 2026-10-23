import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import { serializeChapterText } from "@/utils/chapterContent";
import type { ChapterVersion } from "@/types/chapterVersion";

const query = `?bookId=${book.id}&chapterId=${chapter.id}`;
const editorURL = `/books/editor${query}`;
const historyURL = `/books/versions${query}`;
const snapshots: ChapterVersion[] = [3, 2, 1].map((number) => ({
  id: `v${number}`, chapter_id: chapter.id, version_number: number, title: chapter.title,
  content_json: serializeChapterText(`<p>Texto da versão ${number}.</p>`),
  description: `Marco ${number}`, word_count: 5, created_at: `2026-10-23 12:0${number}:00`,
}));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ chapter, snapshots }) => {
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([{ ...chapter, content_json: JSON.stringify({ type: "doc", html: "<p>Texto atual.</p>", text: "Texto atual." }) }]));
    localStorage.setItem("my_book_writer_chapter_versions", JSON.stringify(snapshots));
    localStorage.setItem("mbw_editor_preferences", JSON.stringify({ autosaveEnabled: false }));
  }, { chapter, snapshots });
});

test("manual snapshots capture the unsaved draft and opening a comparison saves the next draft", async ({ page }) => {
  await page.goto(editorURL);
  await page.locator("[contenteditable=true]").fill("Rascunho ainda não salvo.");
  await page.getByRole("button", { name: "Abrir histórico de versões", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Histórico de versões" });
  await panel.getByLabel("Rótulo da versão").fill("Minha versão");
  await panel.getByRole("button", { name: "Criar novo snapshot" }).click();
  await expect(panel.getByRole("button", { name: "Abrir versão #4", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_chapter_versions")!));
  expect(saved[0].content_json).toContain("Rascunho ainda não salvo.");
  expect(saved[0].word_count).toBe(4);
  await page.locator("[contenteditable=true]").fill("Outra mudança antes da comparação.");
  await panel.getByRole("button", { name: "Abrir versão #4", exact: true }).click();
  await expect(page).toHaveURL(/\/books\/versions.*versionId=/);
  await expect(page.locator("ins").filter({ hasText: "Outra" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_chapters"))).toContain("Outra mudança antes da comparação.");
});

test("restoring preserves the replaced text and rich content and returns to the same chapter", async ({ page }) => {
  await page.goto(historyURL + "&versionId=v1");
  await page.getByRole("button", { name: "Restaurar versão #1", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Restaurar versão #1", exact: true });
  await dialog.getByRole("button", { name: "Confirmar restauração" }).click();
  await expect(page).toHaveURL(new RegExp(`/books/editor\\?bookId=${book.id}&chapterId=${chapter.id}`));
  await expect(page.locator("[contenteditable=true]")).toHaveText("Texto da versão 1.");
  const versions = await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_chapter_versions")!));
  expect(versions[0].description).toContain("Antes de restaurar versão #1");
  expect(versions[0].content_json).toContain("Texto atual.");
});

test("a concurrently changed chapter cannot be silently overwritten", async ({ page }) => {
  await page.goto(historyURL + "&versionId=v1");
  await expect(page.getByRole("button", { name: "Restaurar versão #1", exact: true })).toBeEnabled();
  await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem("my_book_writer_chapters")!);
    list[0].content_revision++;
    list[0].content_json = JSON.stringify({ text: "Texto da outra janela" });
    localStorage.setItem("my_book_writer_chapters", JSON.stringify(list));
  });
  await page.getByRole("button", { name: "Restaurar versão #1", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Restaurar versão #1", exact: true });
  await dialog.getByRole("button", { name: "Confirmar restauração" }).click();
  await expect(dialog.getByRole("alert")).toContainText("mudou");
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_chapters"))).toContain("Texto da outra janela");
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: "Atualizar comparação" }).click();
  await expect(page.locator("ins").filter({ hasText: "outra" })).toBeVisible();
});

test("previous-version labels and change navigation work in both comparison layouts", async ({ page }) => {
  await page.goto(historyURL + "&versionId=v3");
  await page.getByRole("button", { name: "Versão anterior", exact: true }).click();
  await page.getByRole("button", { name: "Mudar para visão lado a lado" }).click();
  await expect(page.getByRole("heading", { name: "Snapshot #2", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Snapshot #3", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Próxima alteração", exact: true }).click();
  await expect(page.locator('[data-change-id="change-1"][data-active=true]')).toBeInViewport();
  await page.getByRole("button", { name: "Abrir versão #1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Versão anterior", exact: true })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Texto Atual no Editor", exact: true })).toBeVisible();
});

test("deleting the selected last snapshot keeps the URL and empty state coherent", async ({ page }) => {
  await page.addInitScript((version) => localStorage.setItem("my_book_writer_chapter_versions", JSON.stringify([version])), snapshots[2]);
  await page.goto(historyURL + "&versionId=v1");
  await page.getByRole("button", { name: "Excluir versão #1", exact: true }).click();
  await page.getByRole("dialog", { name: "Excluir versão", exact: true }).getByRole("button", { name: "Sim, excluir versão" }).click();
  await expect(page.getByRole("heading", { name: "Este capítulo ainda não tem versões" })).toBeVisible();
  await expect(page).not.toHaveURL(/versionId=/);
  await page.getByRole("button", { name: "Salvar versão atual" }).click();
  await expect(page.getByRole("button", { name: /Abrir versão #/ })).toHaveCount(1);
});

test("storage failures retain the snapshot label and allow retry", async ({ page }) => {
  await page.goto(editorURL);
  await page.getByRole("button", { name: "Abrir histórico de versões", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Histórico de versões" });
  await panel.getByLabel("Rótulo da versão").fill("Preservar rótulo");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let fail = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === "my_book_writer_chapter_versions" && fail) { fail = false; throw new Error("Falha ao salvar versão"); }
      original.call(this, key, value);
    };
  });
  await panel.getByRole("button", { name: "Criar novo snapshot" }).click();
  await expect(panel.getByRole("alert")).toContainText("Falha ao salvar versão");
  await expect(panel.getByLabel("Rótulo da versão")).toHaveValue("Preservar rótulo");
  await panel.getByRole("button", { name: "Criar novo snapshot" }).click();
  await expect(panel.getByLabel("Rótulo da versão")).toHaveValue("");
  await expect(panel.getByText("Preservar rótulo", { exact: true })).toBeVisible();
});

test("loading failure offers retry instead of a misleading empty history", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    sessionStorage.setItem("history-read-failure", "true");
    Storage.prototype.getItem = function (key) {
      if (key === "my_book_writer_chapter_versions" && sessionStorage.getItem("history-read-failure") === "true") throw new Error("Falha ao ler histórico");
      return original.call(this, key);
    };
  });
  await page.goto(historyURL);
  await expect(page.locator("main").getByRole("alert")).toContainText("histórico");
  await page.evaluate(() => sessionStorage.setItem("history-read-failure", "false"));
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByRole("button", { name: "Abrir versão #3", exact: true })).toBeVisible();
});

for (const theme of ["light", "dark"]) {
  test(`${theme} history remains operable on a narrow window and from the keyboard`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(historyURL + "&versionId=v3");
    const version = page.getByRole("button", { name: "Abrir versão #2", exact: true });
    await version.focus(); await page.keyboard.press("Enter");
    await expect(version).toHaveAttribute("aria-pressed", "true");
    for (const name of ["Alteração anterior", "Próxima alteração", "Mudar para visão lado a lado"]) {
      await expect(page.getByRole("button", { name, exact: true })).toBeInViewport({ ratio: 1 });
    }
    expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  });
}
