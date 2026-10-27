import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedDesktop } from "@/tests/e2e/panelWorkspaceFixtures";

test("catalog restores its search, view and scroll after a dossier and history navigation", async ({ page }) => {
  await seedDesktop(page);
  await page.goto("/codex?universeId=world");
  const catalog = page.locator("[data-codex-catalog]");
  const pane = page.getByRole("region", { name: "Catálogo do Códice", exact: true });
  await expect(catalog.getByRole("heading", { name: "Suas fichas (18)", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Visualizar em lista", exact: true }).click();
  await page.getByLabel("Buscar fichas").fill("Aurora");
  const link = catalog.getByRole("link", { name: "Ver ficha de Personagem de Aurora 14", exact: true });
  await link.scrollIntoViewIfNeeded();
  const position = await pane.evaluate((element) => element.scrollTop);
  expect(position).toBeGreaterThan(0);
  await link.click();
  await expect(page.getByRole("heading", { level: 1, name: "Personagem de Aurora 14", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Navegador de fichas", exact: true })).toBeHidden();
  await page.getByRole("link", { name: "Voltar ao Códice", exact: true }).click();
  await expect(catalog).toHaveAttribute("data-view", "list");
  await expect(page.getByLabel("Buscar fichas")).toHaveValue("Aurora");
  await expect.poll(() => pane.evaluate((element) => element.scrollTop)).toBe(position);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: "Personagem de Aurora 14", exact: true })).toBeVisible();
  await page.goForward();
  await expect.poll(() => pane.evaluate((element) => element.scrollTop)).toBe(position);
});

test("opening and closing the navigator preserves drafts and menu actions remain usable by keyboard", async ({ page }) => {
  await seedDesktop(page);
  await page.goto("/codex/sheet?universeId=world&entityId=desktop-person-0");
  const status = page.getByLabel("Status", { exact: true });
  await status.fill("Rascunho local");
  await page.getByRole("button", { name: "Ver fichas", exact: true }).click();
  const dossier = page.getByRole("region", { name: "Conteúdo da ficha", exact: true });
  await dossier.evaluate((element) => { element.scrollTop = 200; });
  const position = await dossier.evaluate((element) => element.scrollTop);
  await page.getByLabel("Buscar fichas").fill("Aurora 18");
  expect(await dossier.evaluate((element) => element.scrollTop)).toBe(position);
  await page.getByRole("link", { name: "Ver ficha de Personagem de Aurora 18", exact: true }).click();
  await page.getByRole("dialog", { name: "Descartar alterações?" }).getByRole("button", { name: "Continuar editando" }).click();
  await page.getByRole("button", { name: "Ocultar lista", exact: true }).click();
  await expect(status).toHaveValue("Rascunho local");
  const options = page.getByRole("button", { name: "Opções da ficha", exact: true });
  await options.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Salvar como modelo", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(options).toBeFocused();
  await page.getByRole("link", { name: "Voltar ao Códice", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Descartar alterações?" })).toBeVisible();
});

for (const theme of ["light", "dark"]) for (const width of [320, 390, 800, 1440, 2560]) {
  test(`catalog and dossier fit the workspace and remain accessible in ${theme} at ${width}`, async ({ page }, testInfo) => {
    await seedDesktop(page);
    await page.setViewportSize({ width, height: width === 320 ? 600 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto("/codex?universeId=world");
    if (width === 2560) await page.getByRole("button", { name: "Expandir menu", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(18);
    const catalog = page.locator("[data-codex-catalog]");
    const create = await catalog.getByRole("button", { name: "Nova ficha", exact: true }).boundingBox();
    const first = await catalog.getByRole("article").first().boundingBox();
    expect(create?.width).toBeCloseTo(first!.width, 0);
    expect(create?.height).toBeCloseTo(first!.height, 0);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    if ([390, 1440].includes(width) && testInfo.project.name === "chromium" && process.platform === "linux") {
      await expect(page).toHaveScreenshot(`codex-catalog-${theme}-${width}.png`, { animations: "disabled", caret: "hide" });
    }
    await page.getByRole("button", { name: "Visualizar em lista", exact: true }).click();
    await expect(catalog).toHaveAttribute("data-view", "list");
    await catalog.getByRole("link", { name: "Ver ficha de Personagem de Aurora 1", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Personagem de Aurora 1", exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Navegador de fichas", exact: true })).toBeHidden();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.locator("[data-codex-detail]").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/my-book-writer-dossier-${theme}-${width}-${testInfo.project.name}.png` });
  });
}
