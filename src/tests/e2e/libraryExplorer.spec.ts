import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import { book } from "@/tests/fixtures/book";
import { mockDesktopWindow } from "@/tests/e2e/windowMock";
import { mockUI } from "@/tests/e2e/uiMock";
import { test, expect } from "@/tests/e2e/fixtures";

const world: Universe = {
  id: "world", name: "Terras do Norte", profile_id: book.profile_id, description: "Um mundo compartilhado",
  position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null,
};
const saga: BookSeries = { ...world, id: "saga", name: "Trilogia", universe_id: null };
const nested: BookSeries = { ...saga, id: "nested", name: "Crônicas", universe_id: world.id };
const volumes: Book[] = [1, 2, 3].map((volume) => ({ ...book, id: `v${volume}`, title: `Volume ${volume}`,
  series_id: saga.id, series_volume: volume }));
const free: Book = { ...book, id: "free", title: "Avulso" };
const books = [...volumes, free, { ...book, id: "world-direct", title: "Atlas", universe_id: world.id },
  { ...book, id: "nested-book", title: "Origem", series_id: nested.id, series_volume: 1, universe_id: world.id }];

async function seed(page: Page, options: { books?: Book[]; series?: BookSeries[]; universes?: Universe[] } = {}) {
  await page.addInitScript(({ books, series, universes }) => {
    if (sessionStorage.getItem("explorer-seeded")) return;
    sessionStorage.setItem("explorer-seeded", "yes");
    localStorage.setItem("my_book_writer_books", JSON.stringify(books));
    localStorage.setItem("my_book_writer_series", JSON.stringify(series));
    localStorage.setItem("my_book_writer_universes", JSON.stringify(universes));
  }, { books: options.books ?? books, series: options.series ?? [saga, nested], universes: options.universes ?? [world] });
}
async function saved(page: Page): Promise<Book[]> {
  return page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_books") ?? "[]"));
}

test("mixed explorer cards navigate universes, nested series and books with browser history", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  await expect(page.locator("main").getByRole("article")).toHaveCount(3);
  await expect(page.locator('[data-collection-id="saga"] .collection-cover .book-cover-title')).toHaveText(["Volume 1", "Volume 2", "Volume 3"]);
  await page.getByRole("link", { name: "Abrir universo Terras do Norte", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(world.name);
  await expect(page.locator("main").getByRole("article")).toHaveCount(2);
  await page.getByRole("link", { name: "Abrir série Crônicas", exact: true }).click();
  await expect(page.locator("main").getByRole("article")).toHaveCount(1);
  await expect(page.locator("main").getByRole("article")).toContainText("Origem");
  const path = page.getByRole("navigation", { name: "Caminho contextual" });
  await expect(path).toContainText("Terras do Norte");
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(world.name);
  await page.getByRole("button", { name: "Avançar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(nested.name);
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(world.name);
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Biblioteca");
});

test("grouping separates collection types into rows and persists alongside list view", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  await expect(page.getByLabel("Agrupar biblioteca")).toHaveValue("mixed");
  await page.getByLabel("Agrupar biblioteca").selectOption("type");
  for (const label of ["Universos", "Séries", "Livros avulsos"]) {
    await expect(page.getByRole("region", { name: label, exact: true }).getByRole("article")).toHaveCount(1);
  }
  await page.getByRole("button", { name: "Visualizar em lista" }).click();
  await page.reload();
  await expect(page.getByLabel("Agrupar biblioteca")).toHaveValue("type");
  await expect(page.getByRole("button", { name: "Visualizar em lista" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".book-list article")).toHaveCount(3);
});

test("each collection reserves three cover-sized slots with translucent solid placeholders", async ({ page }) => {
  const series = [0, 1, 2, 3].map((count) => ({ ...saga, id: `series-${count}`, name: `Série ${count}` }));
  const books = series.flatMap((item, count) => volumes.slice(0, count).map((volume) => ({ ...volume,
    id: `${item.id}-${volume.id}`, series_id: item.id })));
  await seed(page, { books, series, universes: [] });
  await page.goto("/library");
  for (let count = 0; count < 4; count++) {
    const card = page.locator(`[data-collection-id="series-${count}"]`);
    await expect(card.locator(".collection-cover")).toHaveCount(3);
    await expect(card.locator(".collection-cover .book-object")).toHaveCount(count);
    await expect(card.locator(".collection-empty-cover")).toHaveCount(3 - count);
    const slots = await card.locator(".collection-cover").evaluateAll((slots) => slots.map((slot) => {
      const style = getComputedStyle(slot);
      return [parseFloat(style.width), parseFloat(style.height)];
    }));
    expect(slots.every(([width, height]) => Math.abs(width / height - 14 / 21) < .01)).toBe(true);
    for (const slot of await card.locator(".collection-empty-cover").all()) {
      await expect(slot).toHaveCSS("border-top-width", "0px");
      const alpha = await slot.evaluate((element) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d")!;
        context.fillStyle = getComputedStyle(element).backgroundColor;
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data[3];
      });
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(255);
    }
  }
});

test("dragging a standalone book onto a series appends a persisted automatic volume", async ({ page, context }) => {
  await seed(page);
  await page.goto("/library");
  await expect(page.locator('[data-book-id="free"]')).toBeVisible();
  await context.setOffline(true);
  await page.locator('[data-book-id="free"]').dragTo(page.locator('[data-collection-id="saga"]'));
  await expect(page.locator('[data-book-id="free"]')).toHaveCount(0);
  await expect(page.locator('[data-collection-id="saga"]')).toContainText("4 livros");
  expect((await saved(page)).find((item) => item.id === free.id)).toMatchObject({ series_id: saga.id, series_volume: 4 });
  await context.setOffline(false);
  await page.reload();
  await page.getByRole("link", { name: "Abrir série Trilogia", exact: true }).click();
  await expect(page.locator('[data-book-id="free"]')).toContainText("Vol. 4");
});

test("dropping on a universe creates direct membership and shows its cover in the collection", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  await page.locator('[data-book-id="free"]').dragTo(page.locator('[data-collection-id="world"]'));
  await expect(page.locator('[data-collection-id="world"]')).toContainText("3 livros");
  expect((await saved(page)).find((item) => item.id === free.id)).toMatchObject({ universe_id: world.id, series_id: null });
  await page.getByRole("link", { name: "Abrir universo Terras do Norte", exact: true }).click();
  await expect(page.locator('[data-book-id="free"]')).toBeVisible();
});

test("keyboard move dialog transfers volumes between universes and series and compacts the old sequence", async ({ page }) => {
  await seed(page);
  await page.goto("/library?seriesId=saga");
  const card = page.locator('[data-book-id="v2"]');
  await card.getByLabel("Ações de Volume 2").click();
  await card.getByRole("button", { name: "Mover livro", exact: true }).click();
  await page.getByLabel("Destino").selectOption("series:nested");
  await page.getByRole("dialog").getByRole("button", { name: "Mover livro", exact: true }).click();
  await expect(card).toHaveCount(0);
  expect((await saved(page)).find((item) => item.id === "v2")).toMatchObject({ series_id: nested.id, series_volume: 2, universe_id: world.id });
  expect((await saved(page)).find((item) => item.id === "v3")?.series_volume).toBe(2);
  await page.goto("/library?seriesId=nested");
  const moved = page.locator('[data-book-id="v2"]');
  await moved.getByLabel("Ações de Volume 2").click();
  await moved.getByRole("button", { name: "Mover livro", exact: true }).click();
  await page.getByLabel("Destino").selectOption("root");
  await page.getByRole("dialog").getByRole("button", { name: "Mover livro", exact: true }).click();
  await expect(moved).toHaveCount(0);
  expect((await saved(page)).find((item) => item.id === "v2")).toMatchObject({ series_id: null, series_volume: null, universe_id: null });
});

test("empty universes can be created, contain new series and be deleted without losing content", async ({ page }) => {
  await seed(page, { books: [], series: [], universes: [] });
  await page.goto("/library");
  await page.getByRole("button", { name: "Novo universo", exact: true }).click();
  await page.getByLabel("Nome do universo").fill("Mundo novo");
  await page.getByRole("button", { name: "Salvar universo", exact: true }).click();
  await page.getByRole("link", { name: "Abrir universo Mundo novo", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Este universo ainda não tem livros ou séries." })).toBeVisible();
  await page.getByRole("button", { name: "Nova série", exact: true }).click();
  await page.getByLabel("Nome da série").fill("Uma jornada");
  await page.getByRole("button", { name: "Salvar série", exact: true }).click();
  await expect(page.getByRole("link", { name: "Abrir série Uma jornada", exact: true })).toBeVisible();
  await page.goto("/library");
  await page.getByLabel("Ações de Mundo novo", { exact: true }).click();
  await page.getByRole("button", { name: "Excluir universo Mundo novo", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Excluir universo", exact: true }).click();
  await expect(page.getByRole("link", { name: "Abrir série Uma jornada", exact: true })).toBeVisible();
});

test("search finds collections by their own names and the books they contain", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  await page.getByLabel("Buscar por título ou autor").fill("Terras do Norte");
  await expect(page.locator("main").getByRole("article")).toHaveCount(1);
  await page.getByRole("link", { name: "Abrir universo Terras do Norte", exact: true }).click();
  await expect(page.getByLabel("Buscar por título ou autor")).toHaveValue("");
  await page.goto("/library");
  await page.getByLabel("Buscar por título ou autor").fill("Volume 2");
  await expect(page.locator("main").getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Abrir série Trilogia", exact: true })).toBeVisible();
});

for (const theme of ["light", "dark"]) {
  test(`explorer collection cards are accessible and fit narrow layouts in ${theme}`, async ({ page }, testInfo) => {
    await page.clock.setFixedTime(new Date("2026-10-24T12:00:00.000Z"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seed(page);
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto("/library");
    await expect(page.locator("main").getByRole("article")).toHaveCount(3);
    for (const width of [360, 800, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.locator("main").evaluate((main) => main.scrollWidth <= main.clientWidth)).toBe(true);
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    if (testInfo.project.name === "chromium" && process.platform === "linux") {
      await expect(page).toHaveScreenshot(`library-explorer-${theme}.png`, {
        animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.001,
      });
    }
  });
}

test("failed native book moves retain the source and can be retried from the dialog", async ({ page }) => {
  await mockUI(page, { books: [...volumes, free] });
  await page.addInitScript((saga) => {
    const runtime = window as unknown as {
      __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
      moveCalls: number;
    };
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    runtime.moveCalls = 0;
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "list_series") return [saga];
      if (command === "update_book" && ++runtime.moveCalls === 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        throw new Error("Não foi possível mover o livro. Tente novamente.");
      }
      return invoke(command, args);
    };
  }, saga);
  await page.goto("/library");
  const source = page.locator('[data-book-id="free"]');
  await source.getByLabel("Ações de Avulso").click();
  await source.getByRole("button", { name: "Mover livro", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Destino").selectOption("series:saga");
  await dialog.getByRole("button", { name: "Mover livro", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Não foi possível mover o livro.");
  await expect(source).toBeVisible();
  await dialog.getByRole("button", { name: "Mover livro", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(source).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { moveCalls: number }).moveCalls)).toBe(2);
});

test("dragging a series into a universe preserves all volumes and produces the complete book path", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  await page.locator('[data-collection-id="saga"]').dragTo(page.locator('[data-collection-id="world"]'));
  await expect(page.locator('[data-collection-id="saga"]')).toHaveCount(0);
  expect((await saved(page)).filter((item) => item.series_id === saga.id).map((item) => [item.series_volume, item.universe_id]))
    .toEqual([[1, world.id], [2, world.id], [3, world.id]]);
  await page.reload();
  await page.getByRole("link", { name: "Abrir universo Terras do Norte", exact: true }).click();
  await page.getByRole("link", { name: "Abrir série Trilogia", exact: true }).click();
  await page.locator("main").getByRole("link", { name: "Volume 1", exact: true }).click();
  const path = page.getByRole("navigation", { name: "Caminho contextual" });
  await expect(path.locator("li")).toHaveText(["Biblioteca", world.name, saga.name, "Volume 1"]);
  await expect(path.getByRole("link", { name: world.name, exact: true })).toHaveAttribute("href", "/library?universeId=world");
  await expect(path.getByRole("link", { name: saga.name, exact: true })).toHaveAttribute("href", "/library?seriesId=saga");
  for (const [route, label] of [["settings", "Configurações"], ["front-matter", "Pré-textuais"], ["preview", "Prévia"], ["editor", "Editor"], ["export", "Exportar"], ["versions", "Histórico"]]) {
    await page.goto(`/books/${route}?bookId=v1`);
    await expect(path.locator("li")).toHaveText(["Biblioteca", world.name, saga.name, "Volume 1", label]);
  }
});

test("a book retains its universe when entering an independent series and its series when adding a universe", async ({ page }) => {
  await seed(page);
  await page.goto("/library?universeId=world");
  const atlas = page.locator('[data-book-id="world-direct"]');
  await atlas.getByLabel("Ações de Atlas").click();
  await atlas.getByRole("button", { name: "Mover livro", exact: true }).click();
  await page.getByLabel("Destino").selectOption("series:saga");
  await page.getByRole("dialog").getByRole("button", { name: "Mover livro", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await saved(page)).find((item) => item.id === "world-direct")).toMatchObject({ series_id: saga.id, universe_id: world.id, series_volume: 4 });
  await page.goto("/library?seriesId=saga");
  const first = page.locator('[data-book-id="v1"]');
  await first.getByLabel("Ações de Volume 1").click();
  await first.getByRole("button", { name: "Mover livro", exact: true }).click();
  await page.getByLabel("Destino").selectOption("universe:world");
  await page.getByRole("dialog").getByRole("button", { name: "Mover livro", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(first).toBeVisible();
  expect((await saved(page)).find((item) => item.id === "v1")).toMatchObject({ series_id: saga.id, universe_id: world.id, series_volume: 1 });
});

test("series cannot contain series or universes and series moves are accessible by keyboard", async ({ page }) => {
  await seed(page, { series: [saga, { ...saga, id: "other", name: "Outra série" }] });
  await page.goto("/library");
  const source = page.locator('[data-collection-id="saga"]');
  await expect(page.locator('[data-collection-id="world"]')).toHaveAttribute("draggable", "false");
  await source.dragTo(page.locator('[data-collection-id="other"]'));
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_series") ?? "[]").map((item: BookSeries) => item.universe_id))).toEqual([null, null]);
  await source.getByLabel("Ações de Trilogia").click();
  await source.getByRole("button", { name: "Mover série", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Mover série", exact: true });
  await expect(dialog.getByLabel("Destino").locator("option")).toHaveCount(2);
  await dialog.getByLabel("Destino").selectOption("universe:world");
  await dialog.getByRole("button", { name: "Mover série", exact: true }).click();
  await expect(source).toHaveCount(0);
});

test("deep book paths keep native controls visible in narrow windows and omit stale ancestors", async ({ page }) => {
  await mockDesktopWindow(page, { books: [volumes[0], free] });
  await page.addInitScript(({ world, saga }) => {
    const runtime = window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> } };
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "list_series") return [{ ...saga, universe_id: world.id }];
      if (command === "list_universes") return [world];
      return invoke(command, args);
    };
  }, { world, saga });
  await page.goto("/books/settings?bookId=v1");
  const path = page.getByRole("navigation", { name: "Caminho contextual" });
  await expect(path.locator("li")).toHaveText(["Biblioteca", world.name, saga.name, "Volume 1", "Configurações"]);
  for (const width of [800, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const controls = page.locator(".window-controls");
    await expect(controls.getByRole("button", { name: "Fechar janela", exact: true })).toBeInViewport({ ratio: 1 });
    expect((await path.boundingBox())!.x + (await path.boundingBox())!.width).toBeLessThanOrEqual((await controls.boundingBox())!.x);
  }
  await page.goto("/books/view?bookId=free");
  await expect(path.locator("li")).toHaveText(["Biblioteca", free.title]);
});

test("universe covers form an open fan while series covers retain their sequential stack", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  const seriesSlots = page.locator('[data-collection-id="saga"] .collection-cover');
  const worldSlots = page.locator('[data-collection-id="world"] .collection-cover');
  await expect(seriesSlots).toHaveCount(3);
  await expect(worldSlots).toHaveCount(3);
  const transforms = async (slots: ReturnType<Page["locator"]>) => slots.evaluateAll((items) => items.map((item) => getComputedStyle(item).transform));
  expect(await transforms(worldSlots)).not.toEqual(await transforms(seriesSlots));
});

test("stacked and fanned covers stay inside their canvas in grid and list views", async ({ page }) => {
  await seed(page);
  await page.goto("/library");
  for (const width of [360, 800, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const view of ["grade", "lista"]) {
      await page.getByRole("button", { name: `Visualizar em ${view}` }).click();
      const contained = await page.locator(".collection-stage").evaluateAll((canvases) => canvases.every((canvas) => {
        const bounds = canvas.getBoundingClientRect();
        return [...canvas.querySelectorAll(".collection-cover")].every((cover) => {
          const rect = cover.getBoundingClientRect();
          return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1
            && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
        });
      }));
      expect(contained).toBe(true);
    }
  }
});

for (const linked of [true, false]) {
  test(`removing a series universe takes its books along (linked=${linked})`, async ({ page }) => {
    await seed(page, {
      books: [...volumes.map((book) => ({ ...book, universe_id: world.id })), ...books.slice(3)],
      series: [{ ...saga, universe_id: linked ? world.id : null }, nested],
    });
    await page.goto(linked ? "/library?universeId=world" : "/library");
    const card = page.locator('[data-collection-id="saga"]');
    await card.getByLabel("Ações de Trilogia").click();
    await card.getByRole("button", { name: "Mover série", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Mover série", exact: true });
    await dialog.getByLabel("Destino").selectOption("root");
    await dialog.getByRole("button", { name: "Mover série", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.goto("/library?universeId=world");
    await expect(page.locator("main").getByRole("article")).toHaveCount(2);
    for (const volume of volumes) await expect(page.locator(`[data-book-id="${volume.id}"]`)).toHaveCount(0);
    const persisted = await saved(page);
    expect(persisted).toHaveLength(books.length);
    for (const [index, volume] of volumes.entries()) {
      expect(persisted.find((book) => book.id === volume.id)).toMatchObject({
        series_id: saga.id, universe_id: null, series_volume: index + 1,
      });
    }
    expect(persisted.find((book) => book.id === "world-direct")?.universe_id).toBe(world.id);
    await page.goto("/library");
    await expect(page.locator('[data-collection-id="world"]')).toContainText("2 livros");
    await expect(page.locator('[data-collection-id="saga"]')).toContainText("3 livros");
    await page.getByRole("link", { name: "Abrir série Trilogia", exact: true }).click();
    await expect(page).toHaveURL(/\/library\?seriesId=saga$/);
    await page.reload();
    await expect(page.locator("main").getByRole("article")).toHaveCount(3);
    await page.locator("main").getByRole("link", { name: "Volume 1", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Caminho contextual" }).locator("li"))
      .toHaveText(["Biblioteca", saga.name, "Volume 1"]);
  });
}
