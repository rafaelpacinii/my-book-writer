import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses, books, world, saga } from "@/tests/e2e/universeFixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { dragLibraryItem } from "@/tests/e2e/libraryActions";

test("explorer breadcrumbs switch collections and move books or series across Biblioteca, Universo and Série", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/library");
  const crumbs = page.getByRole("navigation", { name: "Caminho do acervo" });
  await crumbs.getByRole("button", { name: "Ver coleções de Biblioteca", exact: true }).click();
  const rootMenu = crumbs.getByRole("region", { name: "Coleções de Biblioteca" });
  await expect(rootMenu.getByRole("link", { name: /Aurora/ })).toBeVisible();
  await expect(rootMenu.getByRole("link", { name: /Série independente/ })).toBeVisible();
  await dragLibraryItem(page, page.locator('[data-book-id="free"]'), rootMenu.getByRole("link", { name: /Aurora/ }));
  const readBooks = () => page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_books") ?? "[]") as Book[]);
  await expect.poll(async () => (await readBooks()).find((book) => book.id === "free")?.universe_id).toBe("world");

  await crumbs.getByRole("button", { name: "Ver coleções de Biblioteca", exact: true }).click();
  await crumbs.getByRole("region", { name: "Coleções de Biblioteca" }).getByRole("link", { name: /Aurora/ }).click();
  await expect(page).toHaveURL(/universeId=world/);
  await crumbs.getByRole("button", { name: "Ver séries de Aurora", exact: true }).click();
  await crumbs.getByRole("region", { name: "Séries de Aurora" }).getByRole("link", { name: /Saga Aurora/ }).click();
  await expect(page).toHaveURL(/seriesId=saga/);
  await expect(crumbs.getByRole("link", { name: "Biblioteca", exact: true })).toBeVisible();
  await expect(crumbs.getByRole("link", { name: "Aurora", exact: true })).toBeVisible();
  await expect(crumbs.getByRole("link", { name: "Saga Aurora", exact: true })).toHaveAttribute("aria-current", "page");
  await crumbs.getByRole("button", { name: "Ver séries de Aurora", exact: true }).click();
  const universeMenu = crumbs.getByRole("region", { name: "Séries de Aurora" });
  await expect(universeMenu.getByRole("link", { name: /Saga Aurora/ })).toHaveAttribute("aria-current", "page");

  await dragLibraryItem(page, page.getByRole("button", { name: "Arrastar Volume 1", exact: true }),
    crumbs.getByRole("link", { name: "Aurora", exact: true }));
  await expect.poll(async () => (await readBooks()).find((book) => book.id === "v1")?.series_id).toBeNull();
  expect((await readBooks()).find((book) => book.id === "v1")).toMatchObject({ universe_id: "world", series_volume: null });

  await dragLibraryItem(page, page.getByRole("button", { name: "Arrastar Volume 2", exact: true }),
    crumbs.getByRole("link", { name: "Biblioteca", exact: true }));
  await expect.poll(async () => (await readBooks()).find((book) => book.id === "v2")?.universe_id).toBeNull();
  expect((await readBooks()).find((book) => book.id === "v2")).toMatchObject({ series_id: null, universe_id: null });

  await crumbs.getByRole("link", { name: "Aurora", exact: true }).click();
  await expect(page).toHaveURL(/universeId=world/);
  await dragLibraryItem(page, page.locator('[data-collection-id="saga"]'),
    crumbs.getByRole("link", { name: "Biblioteca", exact: true }));
  const readSeries = () => page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_series") ?? "[]") as BookSeries[]);
  await expect.poll(async () => (await readSeries()).find((item) => item.id === "saga")?.universe_id).toBeNull();
});

test("failed breadcrumb drops preserve the source and can be retried", async ({ page }) => {
  await mockUI(page, { books });
  await page.addInitScript(({ world, saga }) => {
    const runtime = window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> } };
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    let failed = false;
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "list_universes") return [world];
      if (command === "list_series") return [saga];
      if (command === "update_book" && !failed) { failed = true; throw new Error("Não foi possível mover o livro."); }
      const result = await invoke(command, args);
      if (command === "update_book" && (args?.input as { clear_series?: boolean })?.clear_series) {
        return Object.assign(result as object, { series_id: null, series_volume: null });
      }
      return result;
    };
  }, { world, saga });
  await page.goto("/library?seriesId=saga");
  const source = page.getByRole("button", { name: "Arrastar Volume 1", exact: true });
  const target = page.getByRole("navigation", { name: "Caminho do acervo" })
    .getByRole("link", { name: "Aurora", exact: true });
  await dragLibraryItem(page, source, target);
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível mover o livro.");
  await expect(source).toBeVisible();
  await dragLibraryItem(page, source, target);
  await expect(page.locator('[data-series-book="v1"]')).toHaveCount(0);
});
