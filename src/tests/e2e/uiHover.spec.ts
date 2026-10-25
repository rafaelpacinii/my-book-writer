import type { Locator } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";

const appearance = (target: Locator) => target.evaluate((element) => {
  const style = getComputedStyle(element);
  const bounds = element.getBoundingClientRect();
  return {
    color: style.color, background: style.backgroundColor, border: style.borderColor,
    shadow: style.boxShadow, transform: style.transform, opacity: style.opacity,
    x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
  };
});

for (const theme of ["light", "dark"]) {
  test(`@ui ${theme} rapid hover restores controls and covers without lingering animations`, async ({ page }) => {
    await mockUI(page);
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto("/library");
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole("button", { name: "Expandir menu", exact: true }).click();
    const targets = [
      page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Configurações", exact: true }),
      page.getByRole("button", { name: "Alternar tema" }),
      page.getByRole("button", { name: "Abrir configurações do perfil" }),
      page.locator(".book-card").first(),
    ];
    for (const target of targets) {
      await target.scrollIntoViewIfNeeded();
      await page.mouse.move(1200, 1);
      const cover = target.locator(".book-object");
      const visual = await cover.count() ? cover : target;
      const initial = await appearance(visual);
      for (let index = 0; index < 5; index++) {
        await target.hover();
        await page.mouse.move(1200, 1);
        expect(await appearance(visual)).toEqual(initial);
        expect(await visual.evaluate((element) => element.getAnimations().length)).toBe(0);
      }
    }
    await page.getByRole("button", { name: "Recolher menu", exact: true }).click();
    const library = page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca", exact: true });
    for (let index = 0; index < 5; index++) {
      await library.hover();
      await expect(page.getByRole("tooltip")).toHaveCount(1);
      await page.mouse.move(1200, 1);
      await expect(page.getByRole("tooltip")).toHaveCount(0);
    }
  });
}
