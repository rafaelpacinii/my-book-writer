import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import { book } from "@/tests/fixtures/book";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { createLibraryItem, dragLibraryItem } from "@/tests/e2e/libraryActions";

const saga: BookSeries = {
  id: "saga", profile_id: book.profile_id, universe_id: null, name: "Saga do Norte",
  description: "Uma trilogia", position: 0, created_at: book.created_at,
  updated_at: book.updated_at, deleted_at: null,
};
const volumes = ["Alfa", "Beta", "Gama"].map((title, index) => ({
  ...book, id: `volume-${index + 1}`, title, series_id: saga.id, series_volume: index + 1,
}));

async function seed(page: Page, books: Book[] = volumes, series: BookSeries[] = [saga]) {
  await page.addInitScript(({ books, series }) => {
    if (!sessionStorage.getItem("series-seeded")) {
      localStorage.setItem("my_book_writer_books", JSON.stringify(books));
      localStorage.setItem("my_book_writer_series", JSON.stringify(series));
      sessionStorage.setItem("series-seeded", "yes");
    }
  }, { books, series });
}

async function savedBooks(page: Page): Promise<Book[]> {
  return page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_books") ?? "[]"));
}

async function collectionAction(page: Page, name: string, action: "Editar" | "Excluir") {
  await page.getByLabel(`Ações de ${name}`, { exact: true }).click();
  await page.getByRole("button", { name: `${action} série ${name}`, exact: true }).click();
}

test("series can be created offline before the first book, edited and deleted", async ({ page, context }) => {
  await seed(page, [], []);
  await page.goto("/library");
  const trigger = page.getByRole("button", { name: "Criar na biblioteca", exact: true });
  await expect(trigger).toBeEnabled();
  await context.setOffline(true);
  await createLibraryItem(page, "série");
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome da série").fill("   ");
  await dialog.getByRole("button", { name: "Salvar série" }).click();
  await expect(dialog.getByText("O nome da série é obrigatório.")).toBeVisible();
  await dialog.getByLabel("Nome da série").fill("Horizontes");
  await dialog.getByLabel("Descrição (opcional)").fill("Histórias distantes");
  await dialog.getByRole("button", { name: "Salvar série" }).click();
  await expect(page.getByRole("article")).toContainText("0 livros");
  await collectionAction(page, "Horizontes", "Editar");
  await expect(dialog.getByLabel("Nome da série")).toHaveValue("Horizontes");
  await dialog.getByLabel("Nome da série").fill("Novos horizontes");
  await dialog.getByLabel("Descrição (opcional)").fill("");
  await dialog.getByRole("button", { name: "Salvar série" }).click();
  await expect(page.getByRole("link", { name: "Abrir série Novos horizontes", exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByText("Histórias distantes", { exact: true })).toHaveCount(0);
  await collectionAction(page, "Novos horizontes", "Excluir");
  await dialog.getByRole("button", { name: "Excluir série", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sua biblioteca começa aqui." })).toBeVisible();
});

test("deleting a series preserves books and chapters and supports cancellation", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  await collectionAction(page, "Saga do Norte", "Excluir");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.getByRole("link", { name: "Abrir série Saga do Norte", exact: true })).toBeVisible();
  await collectionAction(page, "Saga do Norte", "Excluir");
  await page.getByRole("dialog").getByRole("button", { name: "Excluir série", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(3);
  expect((await savedBooks(page)).every((item) => item.series_id === null && item.series_volume === null)).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_chapters") ?? "[]"))).toHaveLength(1);
});

test("new book and settings select, change and remove series with automatic volume numbering", async ({ page }) => {
  await seed(page, volumes, [saga, { ...saga, id: "other", name: "Outra série", position: 1 }]);
  await page.goto("/books/new");
  await page.getByLabel("Título do livro", { exact: true }).fill("Delta");
  await page.getByLabel("Série", { exact: true }).selectOption(saga.id);
  await page.getByRole("button", { name: "Criar livro", exact: true }).click();
  await page.waitForURL("**/home");
  const created = (await savedBooks(page)).find((item) => item.title === "Delta");
  expect(created?.series_volume).toBe(4);
  await page.goto(`/books/settings?bookId=${created!.id}`);
  await expect(page.getByLabel("Série", { exact: true })).toHaveValue(saga.id);
  await page.getByLabel("Série", { exact: true }).selectOption("other");
  await expect(page.getByRole("button", { name: "Salvar alterações", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await page.waitForURL("**/books/view?**");
  expect((await savedBooks(page)).find((item) => item.id === created!.id)).toMatchObject({ series_id: "other", series_volume: 1 });
  await page.goto(`/books/settings?bookId=${volumes[1].id}`);
  await page.getByLabel("Série", { exact: true }).selectOption("");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await page.waitForURL("**/books/view?**");
  expect((await savedBooks(page)).find((item) => item.id === volumes[2].id)?.series_volume).toBe(2);
  await page.goto("/library");
  await expect(page.locator(`[data-book-id="${volumes[1].id}"]`)).toContainText("Beta");
});

test("dragging volumes persists their order and ignores the library title sort", async ({ page }) => {
  await seed(page);
  await page.goto("/library?seriesId=saga");
  const group = page.getByRole("region", { name: "Série Saga do Norte" });
  await dragLibraryItem(page, group.getByRole("button", { name: "Arrastar Gama" }), group.locator('[data-series-book="volume-1"]'));
  await expect(group.getByRole("article").first()).toContainText("Gama");
  await expect(group.getByRole("article").first()).toContainText("Vol. 1");
  await page.getByLabel("Ordenar livros").selectOption("title");
  await expect(group.getByRole("article").first()).toContainText("Gama");
  await page.reload();
  await expect(group.getByRole("article").first()).toContainText("Gama");
});

test("keyboard controls reorder with filters without dropping hidden books", async ({ page }) => {
  await seed(page);
  await page.goto("/library?seriesId=saga");
  await page.getByRole("button", { name: "Visualizar em lista" }).click();
  await page.getByLabel("Buscar por título ou autor").fill("Gama");
  const move = page.getByRole("button", { name: "Antecipar Gama" });
  await move.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("article").getByText("Vol. 2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros", exact: true }).first().click();
  const titles = page.getByRole("region", { name: "Série Saga do Norte" }).getByRole("article").getByRole("heading");
  await expect(titles).toHaveText(["Alfa", "Gama", "Beta"]);
  expect((await savedBooks(page)).filter((item) => item.series_id === saga.id)).toHaveLength(3);
});

for (const theme of ["light", "dark"]) {
  test(`series controls are accessible at 800px in ${theme} theme`, async ({ page }) => {
    await seed(page);
    await page.setViewportSize({ width: 800, height: 900 });
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto("/library?seriesId=saga");
    await expect(page.getByRole("button", { name: "Arrastar Alfa" })).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.locator("main").evaluate((main) => main.scrollWidth <= main.clientWidth)).toBe(true);
    await expect(page.getByRole("button", { name: "Editar", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Voltar", exact: true })).toHaveCount(0);
    await expect(page.getByLabel("Nome da série", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Descrição da série", { exact: true })).toBeVisible();
  });
}

test("series IPC loading failure can be retried", async ({ page }) => {
  await mockUI(page);
  await page.addInitScript(() => {
    const runtime = window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> } };
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    let failed = false;
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "list_series" && !failed) {
        failed = true;
        throw new Error("Não foi possível carregar as séries.");
      }
      return invoke(command, args);
    };
  });
  await page.goto("/library");
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível carregar as séries.");
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("failed native reordering keeps the original order and surfaces a retryable error", async ({ page }) => {
  await mockUI(page, { books: volumes });
  await page.addInitScript((saga) => {
    const runtime = window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> } };
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "list_series") return [saga];
      if (command === "reorder_series_books") throw new Error("Não foi possível salvar a ordem dos volumes.");
      return invoke(command, args);
    };
  }, saga);
  await page.goto("/library?seriesId=saga");
  const group = page.getByRole("region", { name: "Série Saga do Norte" });
  await group.getByRole("button", { name: "Antecipar Gama" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível salvar a ordem dos volumes.");
  await expect(group.getByRole("article").getByRole("heading")).toHaveText(["Alfa", "Beta", "Gama"]);
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(group.getByRole("button", { name: "Antecipar Gama" })).toBeEnabled();
});
