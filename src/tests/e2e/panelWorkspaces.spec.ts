import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedDesktop } from "@/tests/e2e/panelWorkspaceFixtures";

test("library collections navigate locally and book inspection preserves the catalog and explicit opening", async ({ page }) => {
  await seedDesktop(page);
  await page.goto("/library");
  const crumbs = page.getByRole("navigation", { name: "Caminho do acervo" });
  await crumbs.getByRole("button", { name: "Ver coleções de Biblioteca", exact: true }).click();
  await crumbs.getByRole("region", { name: "Coleções de Biblioteca" }).getByRole("link", { name: /Aurora/ }).click();
  await expect(page).toHaveURL(/universeId=world/);
  await expect(crumbs.getByRole("link", { name: "Aurora", exact: true })).toHaveAttribute("aria-current", "page");
  await crumbs.getByRole("button", { name: "Ver séries de Aurora", exact: true }).click();
  await crumbs.getByRole("region", { name: "Séries de Aurora" }).getByRole("link", { name: /Saga Aurora/ }).click();
  await expect(page).toHaveURL(/seriesId=saga/);
  await expect(page.locator("[data-series-book]")).toHaveCount(2);
  await crumbs.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await page.getByLabel("Buscar por título ou autor").fill("Avulso");
  const selection = page.getByRole("button", { name: "Ver detalhes de Avulso", exact: true });
  await selection.click();
  await expect(page).toHaveURL(/\/library$/);
  const details = page.getByRole("complementary", { name: "Detalhes da biblioteca" });
  await expect(details.getByRole("heading", { name: "Avulso", exact: true })).toBeVisible();
  await expect(selection).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Buscar por título ou autor")).toHaveValue("Avulso");
  await details.getByRole("button", { name: "Fechar detalhes" }).click();
  await expect(details).toHaveCount(0);
  await expect(selection).toBeFocused();
  await selection.click();
  await details.getByRole("link", { name: "Abrir livro", exact: true }).click();
  await expect(page).toHaveURL(/\/books\/view\?bookId=free$/);
});

test("codex keeps its list, search and scroll while changing sheets and protects all navigation with drafts", async ({ page }) => {
  await seedDesktop(page);
  await page.goto("/codex?universeId=world");
  await page.getByLabel("Buscar fichas").fill("Aurora");
  await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 1", exact: true }).click();
  const list = page.locator("[data-codex-list]");
  await list.evaluate((element) => { element.setAttribute("data-persisted", "yes"); element.scrollTop = 280; });
  const previousScroll = await list.evaluate((element) => element.scrollTop);
  await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 14", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Personagem de Aurora 14", exact: true })).toBeVisible();
  await expect(list).toHaveAttribute("data-persisted", "yes");
  expect(await list.evaluate((element) => element.scrollTop)).toBe(previousScroll);
  await expect(page.getByLabel("Buscar fichas")).toHaveValue("Aurora");
  await expect(page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 14", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByLabel("Status", { exact: true }).fill("Rascunho preservado");
  await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 15", exact: true }).click();
  const discard = page.getByRole("dialog", { name: "Descartar alterações?" });
  await expect(discard).toBeVisible();
  await discard.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Rascunho preservado");
  await page.getByLabel("Universo ou livro").selectOption("book:free");
  await expect(discard).toBeVisible();
  await discard.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page.getByLabel("Universo ou livro")).toHaveValue("universe:world");
  await page.getByRole("tab", { name: "Lugares" }).click();
  await expect(discard).toBeVisible();
  await discard.getByRole("button", { name: "Continuar editando" }).click();
  await page.getByLabel("Buscar fichas").fill("inexistente");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Rascunho preservado");
  await page.getByLabel("Buscar fichas").fill("Aurora");
  await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 15", exact: true }).click();
  await discard.getByRole("button", { name: "Descartar e voltar" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Personagem de Aurora 15", exact: true })).toBeVisible();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Em jornada");
  await page.reload();
  await expect(page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 15", exact: true })).toHaveAttribute("aria-current", "page");
});

for (const theme of ["light", "dark"]) {
  for (const width of [390, 800, 1440]) {
    test(`panel workspaces remain accessible and operable in ${theme} at ${width}`, async ({ page }, testInfo) => {
      await seedDesktop(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.clock.setFixedTime(new Date("2026-10-25T12:00:00.000Z"));
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      await page.goto("/library");
      await page.getByRole("button", { name: "Ver detalhes de Avulso", exact: true }).click();
      const inspector = page.getByRole("complementary", { name: "Detalhes da biblioteca" });
      await expect(inspector).toBeVisible();
      await inspector.getByRole("link", { name: "Abrir livro", exact: true }).scrollIntoViewIfNeeded();
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.screenshot({ path: `/tmp/my-book-writer-library-panels-${theme}-${width}.png` });
      if (width === 1440 && testInfo.project.name === "chromium" && process.platform === "linux") {
        await expect(page).toHaveScreenshot(`library-inspector-${theme}.png`, { animations: "disabled", caret: "hide" });
      }
      await page.goto("/codex?universeId=world");
      await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 1", exact: true }).click();
      await expect(page.getByRole("heading", { level: 2, name: "Personagem de Aurora 1", exact: true })).toBeVisible();
      if (width < 800) {
        await page.getByRole("button", { name: "Ver fichas", exact: true }).click();
        await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 10", exact: true }).click();
        await expect(page.getByRole("heading", { level: 2, name: "Personagem de Aurora 10", exact: true })).toBeVisible();
      }
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.screenshot({ path: `/tmp/my-book-writer-codex-panels-${theme}-${width}.png` });
      if (width === 1440 && testInfo.project.name === "chromium" && process.platform === "linux") {
        await expect(page).toHaveScreenshot(`codex-list-sheet-${theme}.png`, { animations: "disabled", caret: "hide" });
      }
    });
  }
}
