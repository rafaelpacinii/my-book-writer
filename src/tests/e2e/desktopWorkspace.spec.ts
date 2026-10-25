import { test, expect } from "@/tests/e2e/fixtures";
import { seedDesktop } from "@/tests/e2e/panelWorkspaceFixtures";

for (const theme of ["light", "dark"]) {
  for (const width of [800, 1440, 2560]) {
    test(`desktop workspace stays fluid and consistent in ${theme} at ${width}`, async ({ page }) => {
      await seedDesktop(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/home");
      for (const expanded of [false, true]) {
        if (expanded) await page.getByRole("button", { name: "Expandir menu", exact: true }).click();
        const fonts: string[] = [];
        for (const route of ["/home", "/library", "/codex?universeId=world"]) {
          await page.goto(route);
          await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          const bounds = await page.locator("main").evaluate((main) => {
            const content = main.querySelector("[data-page-content]");
            if (!content) throw new Error("Missing workspace content");
            const style = getComputedStyle(main);
            const rect = content.getBoundingClientRect();
            return { available: main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
              width: rect.width, left: rect.left, expectedLeft: main.getBoundingClientRect().left + parseFloat(style.paddingLeft),
              overflow: main.scrollWidth > main.clientWidth };
          });
          expect(bounds.width).toBeCloseTo(bounds.available, 0);
          expect(bounds.left).toBeCloseTo(bounds.expectedLeft, 0);
          expect(bounds.overflow).toBe(false);
          if (width === 2560) expect(bounds.width).toBeGreaterThan(1390);
          fonts.push(await page.getByRole("heading", { level: 1 }).evaluate((heading) => getComputedStyle(heading).fontFamily));
          if (route === "/library") {
            await expect(page.getByRole("navigation", { name: "Navegação da biblioteca" })).toBeVisible();
            expect(await page.locator("[data-library-catalog]").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
          }
          if (route.startsWith("/codex")) {
            await expect(page.getByRole("article")).toHaveCount(18);
            await page.getByLabel("Buscar fichas").fill("Aurora 18");
            await expect(page.getByRole("article")).toHaveCount(1);
            await page.getByLabel("Buscar fichas").clear();
            await expect(page.getByRole("article")).toHaveCount(18);
            if (width === 2560 && expanded) {
              await page.screenshot({ path: `/tmp/my-book-writer-desktop-codex-${theme}.png`, fullPage: true });
            }
          }
        }
        expect(fonts[1]).toEqual(fonts[0]);
        expect(fonts[2]).toEqual(fonts[0]);
      }
    });
  }
}
