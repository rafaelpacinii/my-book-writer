import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";

const routes = [
  ["/home", "Bom te ver, Helena."], ["/library", "Biblioteca"],
  ["/books/new", "Novo livro"], ["/settings", "Configurações"],
];

for (const theme of ["light", "dark"]) {
  test(`@ui ${theme} first paint preserves theme and collapsed sidebar before hydration`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem("mbw-theme-preference", theme);
      localStorage.setItem("mbw_sidebar_collapsed", "true");
    }, theme);
    let release!: () => void;
    const hydration = new Promise<void>((resolve) => { release = resolve; });
    await page.route(/\/_next\/static\/.*\.js/, async (route) => { await hydration; await route.fallback(); });
    await page.goto("/home", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator("[data-app-sidebar]")).toHaveCSS("width", "72px");
    release();
    await expect(page.getByRole("button", { name: "Expandir menu" })).toBeVisible();
    await page.getByRole("button", { name: "Alternar tema" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme === "dark" ? "light" : "dark");
  });

  for (const [width, height] of [[800, 600], [1280, 720], [1440, 1000]]) {
    test(`@ui ${theme} accessible and consistent pages at ${width}x${height}`, async ({ page }) => {
      await mockUI(page);
      await page.setViewportSize({ width, height });
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      for (const [route, title] of routes) {
        await page.goto(route);
        await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        await page.evaluate(() => document.fonts.ready);
        const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(result.violations, `${title} / ${theme}`).toEqual([]);
        expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      }
    });
  }
}

test("@ui system theme follows OS preference and reduced motion disables skeleton pulses", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await mockUI(page, { delay: 500 });
  await page.goto("/library");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".skeleton-pulse").first()).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
