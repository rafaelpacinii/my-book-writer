import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";

for (const theme of ["light", "dark"]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`@ui ${theme} ${reducedMotion} motion keeps covers and dialogs usable`, async ({ page }) => {
      await mockUI(page);
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      await page.emulateMedia({ reducedMotion });
      await page.goto("/library");
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      const card = page.locator(".book-card").first();
      const cover = card.locator(".book-object");
      const initial = await cover.evaluate((element) => getComputedStyle(element).transform);
      await card.hover();
      const durations = await cover.evaluate((element) => element.getAnimations().map((animation) =>
        Number(animation.effect?.getTiming().duration ?? 0)));
      if (reducedMotion === "reduce") expect(durations).toEqual([]);
      else {
        expect(durations.length).toBeGreaterThan(0);
        expect(durations.every((duration) => duration > 0 && duration <= 200)).toBe(true);
      }
      await page.mouse.move(1200, 1);
      await expect.poll(() => cover.evaluate((element) => getComputedStyle(element).transform), { timeout: 1000 }).toBe(initial);

      const trigger = page.getByRole("button", { name: "Criar na biblioteca" });
      await trigger.click();
      await page.getByRole("button", { name: "Criar série", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Nova série" });
      await expect(dialog).toBeVisible();
      if (reducedMotion === "reduce") {
        expect(await dialog.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
      }
      await expect(dialog.getByRole("button", { name: "Fechar diálogo" })).toBeFocused();
      await dialog.getByLabel("Nome da série").fill("Uma série em movimento");
      await expect(dialog.getByLabel("Nome da série")).toHaveValue("Uma série em movimento");
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }
}
