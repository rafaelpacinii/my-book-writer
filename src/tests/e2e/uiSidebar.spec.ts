import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { editorialBooks } from "@/tests/e2e/editorialBooks";

for (const theme of ["light", "dark"]) {
  test(`@ui ${theme} sidebar groups recent books and exposes collapsed tooltips`, async ({ page }) => {
    await mockUI(page, { books: editorialBooks });
    await page.setViewportSize({ width: 800, height: 600 });
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto("/library");
    const sidebar = page.getByRole("complementary", { name: "Menu principal" });
    await expect(page.locator(".workspace-header")).toHaveCount(0);
    await expect(sidebar).toHaveCSS("width", "240px");
    const brand = await sidebar.getByRole("link", { name: "my book writer — início" }).boundingBox();
    const themeToggle = await sidebar.getByRole("button", { name: "Alternar tema" }).boundingBox();
    const profile = await sidebar.getByRole("button", { name: "Abrir configurações do perfil" }).boundingBox();
    expect(brand!.y).toBeLessThan(themeToggle!.y);
    expect(themeToggle!.y + themeToggle!.height).toBeLessThanOrEqual(profile!.y);
    const recent = page.getByRole("region", { name: "Livros recentes", exact: true });
    await expect(recent.getByRole("link")).toHaveCount(3);
    for (const name of ["Início", "Biblioteca", "Novo livro", "Configurações"]) {
      await expect(page.getByRole("navigation").getByRole("link", { name, exact: true })).toBeInViewport({ ratio: 1 });
    }
    await page.getByRole("button", { name: "Ocultar livros recentes" }).click();
    await expect(recent).toBeHidden();
    await page.getByRole("button", { name: "Mostrar livros recentes" }).click();
    await expect(recent).toBeVisible();
    await page.getByRole("button", { name: "Recolher menu", exact: true }).click();
    await expect(page.locator("[data-app-sidebar]")).toHaveCSS("width", "68px");
    await expect(sidebar.getByRole("button", { name: "Alternar tema" })).toBeInViewport({ ratio: 1 });
    await expect(sidebar.getByRole("button", { name: "Abrir configurações do perfil" })).toBeInViewport({ ratio: 1 });
    const library = page.getByRole("navigation").getByRole("link", { name: "Biblioteca", exact: true });
    await library.hover();
    await expect(page.getByRole("tooltip", { name: "Biblioteca", exact: true })).toBeVisible();
    await page.mouse.move(500, 30);
    await library.focus();
    await expect(page.getByRole("tooltip", { name: "Biblioteca", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(result.violations).toEqual([]);
    await page.reload();
    await expect(page.getByRole("button", { name: "Expandir menu" })).toBeVisible();
    await expect(page.locator("[data-app-sidebar]")).toHaveCSS("width", "68px");
  });
}

test("@ui author profile opens from the compact menu and restores focus", async ({ page }) => {
  await mockUI(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/home");
  const trigger = page.getByRole("button", { name: "Abrir menu", exact: true });
  await trigger.click();
  await page.getByRole("dialog", { name: "Menu principal" })
    .getByRole("button", { name: "Abrir configurações do perfil" }).click();
  const profile = page.getByRole("dialog", { name: "Configurações do autor" });
  await expect(profile.getByLabel("Nome ou pseudônimo de autor")).toHaveValue("Helena Duarte");
  await page.keyboard.press("Escape");
  await expect(profile).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
