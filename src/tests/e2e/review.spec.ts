import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";

const url = `/books/editor?bookId=${book.id}&chapterId=${chapter.id}`;
const second = { ...chapter, id: "review-second", title: "Segundo capítulo", position: 1 };
const html = "<p>Frase repetida no manuscrito.</p><p>Frase repetida no manuscrito.</p><p>Trecho final do capítulo.</p>";
const panel = (page: Page) => page.getByRole("complementary", { name: "Revisão do capítulo", exact: true });
const editor = (page: Page) => page.locator(".editor-content");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ chapter, second, html }) => {
    if (localStorage.getItem("review-seeded")) return;
    localStorage.setItem("review-seeded", "true");
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([{ ...chapter, content_json: JSON.stringify({ html }) }, second]));
    localStorage.setItem("mbw_editor_preferences", JSON.stringify({ autosaveEnabled: false }));
  }, { chapter, second, html });
});

async function open(page: Page) {
  await page.goto(url);
  await expect(editor(page)).toBeVisible();
  await page.keyboard.press("Control+Shift+r");
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toBeVisible();
}

async function add(page: Page, body = "Rever este trecho") {
  await panel(page).getByLabel("Novo comentário", { exact: true }).fill(body);
  await panel(page).getByRole("button", { name: "Comentar", exact: true }).click();
  await expect(panel(page).getByText(body, { exact: true })).toBeVisible();
}

async function select(page: Page, index: number) {
  await editor(page).evaluate((element, index) => {
    const range = document.createRange();
    range.selectNodeContents(element.children[index]);
    const selection = window.getSelection()!;
    selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
  }, index);
  await page.getByTitle("Comentar trecho selecionado", { exact: true }).click();
}

async function stored(page: Page) {
  return page.evaluate((chapterId) => {
    const chapters = JSON.parse(localStorage.getItem("my_book_writer_chapters")!);
    return chapters.find((c: { id: string }) => c.id === chapterId) as typeof chapter;
  }, chapter.id);
}

test("review starts unreviewed, persists CRUD and requires resolved comments before completion", async ({ page }) => {
  await open(page);
  await expect(panel(page).getByText("Não revisado", { exact: true })).toBeVisible();
  await add(page);
  await expect(panel(page).getByRole("button", { name: "Concluir revisão", exact: true })).toBeDisabled();
  await panel(page).getByRole("button", { name: "Resolver", exact: true }).click();
  await panel(page).getByRole("button", { name: "Concluir revisão", exact: true }).click();
  await expect(panel(page).getByText("Revisado", { exact: true })).toBeVisible();
  await panel(page).getByRole("button", { name: "Reabrir", exact: true }).click();
  await expect(panel(page).getByText("Em revisão", { exact: true })).toBeVisible();
  await panel(page).getByLabel("Configurações da anotação", { exact: true }).click();
  await panel(page).getByRole("button", { name: "Editar", exact: true }).click();
  await panel(page).getByLabel("Editar comentário", { exact: true }).fill("Anotação editada");
  await panel(page).getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(panel(page).getByText("Anotação editada", { exact: true })).toBeVisible();
  await page.reload(); await expect(editor(page)).toBeVisible(); await page.keyboard.press("Control+Shift+r");
  await expect(panel(page).getByText("Anotação editada", { exact: true })).toBeVisible();
  await panel(page).getByLabel("Configurações da anotação", { exact: true }).click();
  await panel(page).getByRole("button", { name: "Excluir", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Excluir comentário", exact: true });
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(panel(page).getByText("Anotação editada", { exact: true })).toBeVisible();
  await panel(page).getByLabel("Configurações da anotação", { exact: true }).click();
  await panel(page).getByRole("button", { name: "Excluir", exact: true }).click();
  await dialog.getByRole("button", { name: "Excluir comentário", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(panel(page).getByText("Anotação editada", { exact: true })).toHaveCount(0);
});

test("selected occurrence is located without adding temporary markup to the saved manuscript", async ({ page }) => {
  await open(page); await select(page, 1); await add(page);
  const anchor = await page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem("my_book_writer_review_comments")!)[0].anchor_json));
  expect(anchor.start).toBe("Frase repetida no manuscrito.".length);
  await panel(page).getByTitle("Clique para ir até este trecho no texto", { exact: true }).click();
  await expect(page.locator("[data-review-highlight]")).toBeAttached();
  const highlight = await page.locator("[data-review-highlight] > div").first().boundingBox();
  const target = await editor(page).locator("p").nth(1).boundingBox();
  expect(Math.abs(highlight!.y - target!.y)).toBeLessThan(10);
  await editor(page).press("Control+End");
  await page.keyboard.insertText(" Continuação");
  await page.keyboard.press("Control+s");
  await expect.poll(async () => (await stored(page)).content_revision).toBe(2);
  const saved = JSON.parse((await stored(page)).content_json).html;
  expect(saved).toContain("Continuação");
  expect(saved).not.toContain("<mark");
  expect(saved).not.toContain("review-highlight");
  expect(saved).not.toContain("bg-amber");
});

test("removed excerpts preserve the comment and explain why they cannot be located", async ({ page }) => {
  await open(page); await select(page, 2); await add(page);
  await editor(page).fill("O texto anterior foi removido.");
  await page.keyboard.press("Control+s");
  await expect(panel(page).getByText("Trecho removido ou alterado. A anotação foi preservada.", { exact: true })).toBeVisible();
  await expect(panel(page).getByText("Rever este trecho", { exact: true })).toBeVisible();
  await expect(panel(page).getByTitle("Trecho removido ou alterado", { exact: true })).toBeDisabled();
});

test("completion saves the draft with its actual revision and new changes invalidate it", async ({ page }) => {
  await open(page);
  await editor(page).fill("Texto revisado ainda não salvo.");
  await panel(page).getByRole("button", { name: "Concluir revisão", exact: true }).click();
  await expect(panel(page).getByText("Revisado", { exact: true })).toBeVisible();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_review_progress")!)["chapter-test"]);
  expect(progress.reviewed_content_revision).toBe((await stored(page)).content_revision);
  expect((await stored(page)).content_json).toContain("Texto revisado ainda não salvo.");
  await editor(page).fill("Uma alteração posterior exige nova revisão.");
  await expect(panel(page).getByText("Texto alterado", { exact: true })).toBeVisible();
  await page.keyboard.press("Control+s");
  await expect.poll(async () => (await stored(page)).content_revision).toBe(3);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_review_progress")!)["chapter-test"].needs_recheck)).toBe(true);
});

test("new and edited drafts survive closing, history and focus while staying scoped to their chapter", async ({ page }) => {
  await open(page); await add(page);
  await panel(page).getByLabel("Configurações da anotação", { exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(panel(page).getByRole("button", { name: "Editar", exact: true })).toBeHidden();
  await panel(page).getByLabel("Configurações da anotação", { exact: true }).click();
  await panel(page).getByRole("button", { name: "Editar", exact: true }).click();
  await panel(page).getByLabel("Editar comentário").fill("Edição ainda em andamento");
  await panel(page).getByLabel("Novo comentário", { exact: true }).fill("Rascunho do primeiro capítulo");
  await panel(page).getByRole("button", { name: "Fechar painel de revisão", exact: true }).click();
  await page.keyboard.press("Control+Shift+r");
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("Rascunho do primeiro capítulo");
  await expect(panel(page).getByLabel("Editar comentário")).toHaveValue("Edição ainda em andamento");
  await page.keyboard.press("Control+Shift+h"); await page.keyboard.press("Control+Shift+r");
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("Rascunho do primeiro capítulo");
  await page.getByRole("complementary").filter({ hasText: "Capítulos" }).getByText(second.title, { exact: true }).click();
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("");
  await page.getByRole("complementary").filter({ hasText: "Capítulos" }).getByText(chapter.title, { exact: true }).click();
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("Rascunho do primeiro capítulo");
});

test("failed writes show an error, preserve the draft and allow retry without browser errors", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    let fail = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === "my_book_writer_review_comments" && fail) { fail = false; throw new DOMException("Quota exceeded", "QuotaExceededError"); }
      write.call(this, key, value);
    };
  });
  await panel(page).getByLabel("Novo comentário", { exact: true }).fill("Anotação preservada");
  await panel(page).getByRole("button", { name: "Comentar", exact: true }).click();
  await expect(panel(page).getByRole("alert")).toContainText("Não há espaço");
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("Anotação preservada");
  await panel(page).getByRole("button", { name: "Comentar", exact: true }).click();
  await expect(panel(page).getByText("Anotação preservada", { exact: true })).toBeVisible();
  await expect(panel(page).getByRole("alert")).toHaveCount(0);
});

test("corrupted data has an explicit error and cannot be silently overwritten", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("my_book_writer_review_comments", "{broken"));
  await page.goto(url); await expect(editor(page)).toBeVisible(); await page.keyboard.press("Control+Shift+r");
  await expect(panel(page).getByRole("alert")).toContainText("preservados");
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_review_comments"))).toBe("{broken");
  await page.evaluate(() => localStorage.setItem("my_book_writer_review_comments", "[]"));
  await panel(page).getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toBeVisible();
});

test("review forms, filters and selected text are accessible in light and dark themes", async ({ page }) => {
  await open(page); await add(page); await select(page, 0);
  await panel(page).getByLabel("Configurações da anotação", { exact: true }).click();
  await panel(page).getByRole("button", { name: "Editar", exact: true }).click();
  await expect(panel(page).getByRole("button", { name: "Todos (1)", exact: true })).toHaveAttribute("aria-pressed", "true");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => document.documentElement.setAttribute("data-theme", theme), theme);
    const result = await new AxeBuilder({ page }).include('aside[aria-label="Revisão do capítulo"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(result.violations).toEqual([]);
  }
});

test("narrow windows show the full review panel and locating a comment returns to the manuscript", async ({ page }) => {
  await open(page); await select(page, 1); await add(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await panel(page).boundingBox();
  expect(bounds!.width).toBeGreaterThan(340);
  await expect(panel(page).getByRole("button", { name: "Fechar painel de revisão", exact: true })).toBeInViewport();
  await panel(page).getByTitle("Clique para ir até este trecho no texto", { exact: true }).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(editor(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("chapter save failure blocks review completion and preserves the current draft", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "my_book_writer_chapters") throw new Error("Disco indisponível");
      write.call(this, key, value);
    };
  });
  await editor(page).fill("Rascunho que não pode ser perdido.");
  await panel(page).getByRole("button", { name: "Concluir revisão", exact: true }).click();
  await expect(panel(page).getByRole("alert")).toContainText("Não foi possível salvar o capítulo");
  await expect(editor(page)).toHaveText("Rascunho que não pode ser perdido.");
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_review_progress"))).toBeNull();
});

test("native UTC comment dates display the correct local time", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("my_book_writer_review_comments", JSON.stringify([{
    id: "dated", chapter_id: "chapter-test", author_profile_id: "local-default-id", body: "Comentário com horário UTC",
    original_excerpt: "Capítulo", anchor_json: null, anchor_revision: 1, anchor_state: "removed", status: "open",
    created_at: "2026-10-23 12:00:00", updated_at: "2026-10-23 12:00:00", resolved_at: null,
  }])));
  await open(page);
  await expect(panel(page).locator("time")).toContainText("09:00");
  await expect(panel(page).locator("time")).toHaveAttribute("datetime", "2026-10-23T12:00:00.000Z");
});
