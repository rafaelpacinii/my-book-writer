import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { editorialBooks } from "@/tests/e2e/editorialBooks";

for (const theme of ["light", "dark"]) {
  for (const [width, height] of [[800, 600], [1440, 1000]]) {
    test(`@visual four main screens ${theme} ${width}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium" || process.platform !== "linux", "Linux Chromium owns the visual baselines; native screenshots are separate artifacts.");
      await mockUI(page, { books: editorialBooks });
      await page.setViewportSize({ width, height });
      await page.clock.setFixedTime(new Date("2026-10-22T12:00:00.000Z"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      for (const [route, name] of [["/home", "home"], ["/library", "library"], ["/books/new", "new-book"], ["/settings", "settings"]]) {
        await page.goto(route);
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        await page.evaluate(() => document.fonts.ready);
        await page.locator("[data-brand] img:visible").evaluateAll((images) => Promise.all(
          images.map((image) => (image as HTMLImageElement).decode()),
        ));
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await page.addStyleTag({ content: "nextjs-portal { visibility: hidden; }" });
        await expect(page).toHaveScreenshot(`${name}-${theme}-${width}.png`, {
          animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.001,
        });
      }
    });
  }
}
