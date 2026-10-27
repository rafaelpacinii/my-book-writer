import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses } from "@/tests/e2e/universeFixtures";
import { book } from "@/tests/fixtures/book";
import { mockUI } from "@/tests/e2e/uiMock";

test("all types keep the same positions across scopes and disable only unavailable choices", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/library");
  const types = page.getByRole("group", { name: "Filtrar por tipo" });
  const geometry = () => types.getByRole("button").evaluateAll((buttons) => buttons.map((button) => {
    const { x, y, width, height } = button.getBoundingClientRect();
    return { x, y, width, height };
  }));
  const original = await geometry();
  for (const [query, disabled] of [["universeId=world", ["Universos"]], ["seriesId=saga", ["Séries", "Universos"]]] as const) {
    await page.goto(`/library?${query}`);
    await expect(types.getByRole("button")).toHaveCount(4);
    expect(await geometry()).toEqual(original);
    for (const name of ["Todos", "Livros", "Séries", "Universos"]) {
      const button = types.getByRole("button", { name, exact: true });
      if ((disabled as readonly string[]).includes(name)) await expect(button).toBeDisabled();
      else await expect(button).toBeEnabled();
    }
    await types.getByRole("button", { name: "Livros", exact: true }).click();
    await expect(types.getByRole("button", { name: "Livros", exact: true })).toHaveAttribute("aria-pressed", "true");
  }
});

test("recent cards follow real update order and scope independently of catalog filters", async ({ page }) => {
  await seedUniverses(page);
  await page.addInitScript(() => {
    const books = JSON.parse(localStorage.getItem("my_book_writer_books") ?? "[]") as { id: string; updated_at: string }[];
    const dates: Record<string, string> = { v1: "2026-10-20", v2: "2026-10-22", direct: "2026-10-21", free: "2026-10-23" };
    for (const book of books) book.updated_at = dates[book.id] ?? "2026-10-20";
    localStorage.setItem("my_book_writer_books", JSON.stringify(books));
  });
  await page.goto("/library");
  const recent = page.getByRole("region", { name: "Atualizados recentemente", exact: true });
  await expect(recent.getByRole("link")).toHaveText([/Avulso/, /Volume 2/, /Atlas/]);
  const filters = page.getByRole("region", { name: "Filtros da biblioteca" });
  expect((await recent.boundingBox())!.y).toBeGreaterThan((await filters.boundingBox())!.y + (await filters.boundingBox())!.height);
  await page.getByLabel("Buscar por título ou autor").fill("não existe");
  await expect(page.locator("[data-library-catalog]").getByRole("article")).toHaveCount(0);
  await expect(recent.getByRole("link")).toHaveCount(3);
  await page.goto("/library?seriesId=saga");
  await expect(recent.getByRole("link")).toHaveText([/Volume 2/, /Volume 1/]);
  await recent.getByRole("link", { name: "Retomar Volume 1", exact: true }).click();
  await expect(page).toHaveURL(/\/books\/view\?bookId=v1$/);
});

test("saving a chapter refreshes the recent order without reloading the application", async ({ page }) => {
  await seedUniverses(page);
  await page.addInitScript(() => localStorage.setItem("mbw_editor_preferences", JSON.stringify({ autosaveEnabled: false })));
  await page.goto("/library");
  const recent = page.getByRole("region", { name: "Atualizados recentemente", exact: true });
  await recent.getByRole("link", { name: "Retomar Volume 1", exact: true }).click();
  await page.locator('a[href*="/books/editor"]').first().click();
  await page.locator('[contenteditable="true"]').fill("Uma nova passagem para retomar a história.");
  const footer = page.getByRole("region", { name: "Status do editor" });
  await footer.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(footer.getByRole("status")).toHaveText("Salvo neste dispositivo");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(recent.getByRole("link").first()).toHaveAccessibleName("Retomar Volume 1");
});

for (const theme of ["light", "dark"]) {
  for (const width of [390, 800, 1440]) {
    test(`recent cards stay accessible and fit ${theme} at ${width}`, async ({ page }, testInfo) => {
      await seedUniverses(page);
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.clock.setFixedTime(new Date("2026-10-27T12:00:00Z"));
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      await page.goto("/library");
      const navigation = page.getByRole("navigation", { name: "Navegação da biblioteca" });
      const toggle = navigation.getByRole("button", { name: "Navegação e filtros", exact: true });
      if (await toggle.isVisible()) await toggle.click();
      const recent = navigation.getByRole("region", { name: "Atualizados recentemente", exact: true });
      await expect(recent.getByRole("link")).toHaveCount(3);
      await recent.getByRole("link").last().focus();
      await expect(recent.getByRole("link").last()).toBeFocused();
      expect(await navigation.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await page.screenshot({ path: `/tmp/library-recent-${theme}-${width}-${testInfo.project.name}.png` });
    });
  }
}

test("empty libraries show guidance without fabricated recent activity", async ({ page }) => {
  await mockUI(page, { empty: true });
  await page.goto("/library");
  const recent = page.getByRole("region", { name: "Atualizados recentemente", exact: true });
  await expect(recent.getByRole("link")).toHaveCount(0);
  await expect(recent).toContainText("Os livros deste acervo aparecerão aqui");
});

test("cover retry remains separate from the recent book link", async ({ page }) => {
  await mockUI(page, { books: [{ ...book, card_image_asset_id: "unavailable" }] });
  await page.goto("/library");
  const recent = page.getByRole("region", { name: "Atualizados recentemente", exact: true });
  await expect(recent.getByRole("img", { name: `Capa indisponível: ${book.title}`, exact: true })).toBeVisible();
  const reads = () => page.evaluate(() => (window as unknown as { uiCalls: Record<string, number> }).uiCalls.read_image_data_url ?? 0);
  const before = await reads();
  await recent.getByRole("button", { name: "Recarregar capa", exact: true }).click();
  await expect.poll(reads).toBeGreaterThan(before);
  await expect(page).toHaveURL(/\/library$/);
  await expect(recent.getByRole("link", { name: `Retomar ${book.title}`, exact: true })).toBeVisible();
});
