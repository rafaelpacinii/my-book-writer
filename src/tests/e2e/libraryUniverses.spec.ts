import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { createLibraryItem } from "@/tests/e2e/libraryActions";
import { seedUniverses, world, saga, books } from "@/tests/e2e/universeFixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import type { Book } from "@/types/book";
import type { Universe } from "@/types/universe";

test("type filters find nested collections, combine with search and keep the active universe scope", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/library");
  const types = page.getByRole("group", { name: "Filtrar por tipo" });
  const cards = page.locator("main").getByRole("article");
  await types.getByRole("button", { name: "Séries", exact: true }).click();
  await expect(cards).toHaveCount(2);
  await expect(page.getByRole("link", { name: `Abrir série ${saga.name}`, exact: true })).toBeVisible();
  await page.getByLabel("Buscar por título ou autor").fill("independente");
  await expect(cards).toHaveCount(1);
  await page.getByRole("button", { name: "Limpar filtros", exact: true }).first().click();
  await expect(types.getByRole("button", { name: "Todos", exact: true })).toHaveAttribute("aria-pressed", "true");
  await types.getByRole("button", { name: "Livros", exact: true }).click();
  await expect(cards).toHaveCount(4);
  await types.getByRole("button", { name: "Universos", exact: true }).click();
  await expect(cards).toHaveCount(1);
  await page.getByRole("link", { name: `Abrir universo ${world.name}`, exact: true }).click();
  await types.getByRole("button", { name: "Livros", exact: true }).click();
  await expect(cards).toHaveCount(3);
  await expect(page.locator('[data-book-id="free"]')).toHaveCount(0);
  await types.getByRole("button", { name: "Séries", exact: true }).click();
  await expect(cards).toHaveCount(1);
  await page.getByLabel("Buscar por título ou autor").fill("não existe");
  await expect(page.getByRole("heading", { name: "Nenhum livro encontrado." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar na biblioteca" })).toBeEnabled();
});

test("universe editing validates input and populated deletion preserves all books, volumes and chapters", async ({ page }) => {
  await seedUniverses(page);
  await page.goto(`/library?universeId=${world.id}`);
  await expect(page.getByRole("button", { name: "Editar", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Voltar", exact: true })).toHaveCount(0);
  const titleInput = page.getByLabel("Nome do universo", { exact: true });
  const descInput = page.getByLabel("Descrição do universo", { exact: true });
  await expect(titleInput).toHaveValue(world.name);
  await titleInput.fill("Aurora revisada");
  await descInput.fill("Descrição revisada");
  await descInput.blur();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aurora revisada");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aurora revisada");
  await expect(page.getByLabel("Descrição do universo", { exact: true })).toHaveValue("Descrição revisada");
  const chapters = await page.evaluate(() => localStorage.getItem("my_book_writer_chapters"));
  await page.goto("/library");
  const dialog = page.getByRole("dialog");
  const card = page.locator(`[data-collection-id="${world.id}"]`);
  await card.getByLabel("Ações de Aurora revisada").click();
  await card.getByRole("button", { name: "Excluir universo Aurora revisada", exact: true }).click();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(card).toBeVisible();
  await card.getByLabel("Ações de Aurora revisada").click();
  await card.getByRole("button", { name: "Excluir universo Aurora revisada", exact: true }).click();
  await dialog.getByRole("button", { name: "Excluir universo", exact: true }).click();
  await expect(card).toHaveCount(0);
  const saved: Book[] = await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_books") ?? "[]"));
  expect(saved).toHaveLength(books.length);
  expect(saved.every((item) => item.universe_id === null)).toBe(true);
  expect(saved.filter((item) => item.series_id === saga.id).map((item) => item.series_volume)).toEqual([1, 2]);
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_chapters"))).toBe(chapters);
  await expect(page.getByRole("link", { name: `Abrir série ${saga.name}`, exact: true })).toBeVisible();
});

for (const scope of ["universe", "series"] as const) {
  test(`creation menu carries ${scope} context into a new book`, async ({ page }) => {
    await seedUniverses(page);
    await page.goto(scope === "universe" ? `/library?universeId=${world.id}` : `/library?seriesId=${saga.id}`);
    await createLibraryItem(page, "livro");
    await expect(page.getByLabel("Universo", { exact: true })).toHaveValue(world.id);
    await expect(page.getByLabel("Série", { exact: true })).toHaveValue(scope === "series" ? saga.id : "");
    if (scope === "series") await expect(page.getByLabel("Universo", { exact: true })).toBeDisabled();
    await page.getByLabel("Título do livro", { exact: true }).fill(`Novo livro ${scope}`);
    await page.getByRole("button", { name: "Criar livro", exact: true }).click();
    await expect(page).toHaveURL(/\/home$/);
    const created: Book | undefined = await page.evaluate((title) =>
      JSON.parse(localStorage.getItem("my_book_writer_books") ?? "[]").find((item: Book) => item.title === title), `Novo livro ${scope}`);
    expect(created).toMatchObject({ universe_id: world.id, series_id: scope === "series" ? saga.id : null,
      series_volume: scope === "series" ? 3 : null });
  });
}

test("failed native universe creation keeps input and can be retried", async ({ page }) => {
  await mockUI(page);
  await page.addInitScript((world) => {
    const runtime = window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> } };
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    const universes: Universe[] = [];
    let failures = 1;
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "list_universes") return [...universes];
      if (command === "create_universe") {
        if (failures-- > 0) throw new Error("Não foi possível salvar o universo. Tente novamente.");
        const input = args?.input as { name: string; description: string };
        const created = { ...world, ...input };
        universes.push(created);
        return created;
      }
      return invoke(command, args);
    };
  }, world);
  await page.goto("/library");
  await createLibraryItem(page, "universo");
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome do universo").fill("Mundo recuperado");
  await dialog.getByRole("button", { name: "Salvar universo" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Não foi possível salvar o universo");
  await expect(dialog.getByLabel("Nome do universo")).toHaveValue("Mundo recuperado");
  await dialog.getByRole("button", { name: "Salvar universo" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Abrir universo Mundo recuperado", exact: true })).toBeVisible();
});

for (const theme of ["light", "dark"]) {
  test(`custom select and creation menu are accessible and contained in ${theme}`, async ({ page }, testInfo) => {
    await seedUniverses(page);
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto("/library");
    const trigger = page.getByRole("button", { name: "Criar na biblioteca", exact: true });
    const menu = page.getByRole("group", { name: "Opções de criação" });
    for (const width of [800, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("link", { name: "Criar livro", exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Criar série", exact: true })).toBeFocused();
      await expect(menu).toBeInViewport({ ratio: 1 });
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      if (width === 800 && testInfo.project.name === "chromium") {
        await expect(page).toHaveScreenshot(`library-create-${theme}.png`, { animations: "disabled" });
      }
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
      expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 800, height: 900 });
    const select = page.getByLabel("Agrupar biblioteca");
    await select.selectOption("type");
    await expect(select).toHaveValue("type");
    if (await page.evaluate(() => CSS.supports("appearance", "base-select"))) {
      await select.click();
      await expect(select).toHaveCSS("appearance", "base-select");
      await expect(page.getByRole("option", { name: "Separar por tipo", exact: true })).toBeVisible();
      if (testInfo.project.name === "chromium") {
        await expect(page).toHaveScreenshot(`library-select-${theme}.png`, { animations: "disabled" });
      }
      await page.keyboard.press("Escape");
    }
  });
}
