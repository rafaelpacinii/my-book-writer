import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockDesktopWindow, type WindowRuntime } from "@/tests/e2e/windowMock";

for (const theme of ["light", "dark"]) {
  test(`titlebar and relocated brand follow ${theme} theme before hydration`, async ({ page }) => {
    await mockDesktopWindow(page);
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    let release!: () => void;
    const hydration = new Promise<void>((resolve) => { release = resolve; });
    await page.route(/\/_next\/static\/.*\.js/, async (route) => { await hydration; await route.fallback(); });
    try {
      await page.goto("/home", { waitUntil: "commit" });
      await expect(page.locator("html")).toHaveAttribute("data-desktop", "true");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const brand = page.locator("[data-titlebar-brand] [data-brand=micro]");
      await expect(brand).toBeVisible();
      await expect(brand.locator(theme === "dark" ? ".brand-dark" : ".brand-light")).toBeVisible();
      await expect(page.locator("[data-app-sidebar] [data-brand]")).toHaveCount(0);
    } finally { release(); }
    await page.waitForLoadState("load");
    await expect.poll(() => page.evaluate(() => (window as unknown as WindowRuntime).windowThemes.at(-1))).toBe(theme);
    await page.getByRole("button", { name: "Alternar tema", exact: true }).click();
    const changed = theme === "light" ? "dark" : "light";
    await expect(page.locator("html")).toHaveAttribute("data-theme", changed);
    await expect.poll(() => page.evaluate(() => (window as unknown as WindowRuntime).windowThemes.at(-1))).toBe(changed);
    for (const [width, height] of [[800, 600], [390, 600]]) {
      await page.setViewportSize({ width, height });
      const bar = (await page.locator("[data-app-titlebar]").boundingBox())!;
      const workspace = (await page.locator(".workspace-shell").boundingBox())!;
      expect(workspace.y).toBe(bar.height);
      expect(workspace.y + workspace.height).toBe(height);
      await expect(page.getByRole("button", { name: "Fechar janela", exact: true })).toBeInViewport({ ratio: 1 });
      expect((await new AxeBuilder({ page }).include("[data-app-titlebar]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    }
    await page.screenshot({ path: test.info().outputPath(`titlebar-${theme}.png`), fullPage: true });
  });
}

test("window controls invoke native operations and track external resize", async ({ page }) => {
  await mockDesktopWindow(page);
  await page.goto("/home");
  await page.getByRole("button", { name: "Maximizar janela", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restaurar janela", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Restaurar janela", exact: true }).click();
  await expect(page.getByRole("button", { name: "Maximizar janela", exact: true })).toBeVisible();
  await page.evaluate(() => { const runtime = window as unknown as WindowRuntime; runtime.windowMaximized = true; runtime.emitWindowResize(); });
  await expect(page.getByRole("button", { name: "Restaurar janela", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Minimizar janela", exact: true }).click();
  await page.getByRole("button", { name: "Fechar janela", exact: true }).click();
  const calls = await page.evaluate(() => (window as unknown as WindowRuntime).windowCalls);
  expect(calls.filter((command) => command === "plugin:window|toggle_maximize")).toHaveLength(2);
  expect(calls).toContain("plugin:window|minimize");
  expect(calls).toContain("plugin:window|close");
  await expect(page.locator(".titlebar-drag-region")).toHaveAttribute("data-tauri-drag-region");
  await expect(page.locator(".window-controls [data-tauri-drag-region]")).toHaveCount(0);
});

test("native operation errors are visible and recoverable", async ({ page }) => {
  await mockDesktopWindow(page);
  await page.goto("/home");
  await page.evaluate(() => { (window as unknown as WindowRuntime).windowFailure = "plugin:window|toggle_maximize"; });
  await page.getByRole("button", { name: "Maximizar janela", exact: true }).click();
  await expect(page.locator(".window-control-error")).toContainText("Não foi possível alterar o tamanho da janela");
  await page.getByRole("button", { name: "Dispensar aviso da janela" }).click();
  await page.evaluate(() => { (window as unknown as WindowRuntime).windowFailure = null; });
  await page.getByRole("button", { name: "Maximizar janela", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restaurar janela", exact: true })).toBeVisible();
  await expect(page.locator(".window-control-error")).toHaveCount(0);
});

test("system theme stays delegated to the OS and explicit theme takes precedence", async ({ page }) => {
  await mockDesktopWindow(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/settings");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => (window as unknown as WindowRuntime).windowThemes)).toEqual([null]);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Preferências", exact: true }).click();
  await page.getByRole("button", { name: "Escuro", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as WindowRuntime).windowThemes.at(-1))).toBe("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Sistema", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as WindowRuntime).windowThemes.at(-1))).toBe(null);
});

test("native theme errors can be retried with the same saved preference", async ({ page }) => {
  await mockDesktopWindow(page);
  await page.addInitScript(() => {
    localStorage.setItem("mbw-theme-preference", "dark");
    (window as unknown as WindowRuntime).windowFailure = "plugin:window|set_theme";
  });
  await page.goto("/settings");
  await expect(page.locator(".window-control-error")).toContainText("Não foi possível aplicar o tema à janela");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.evaluate(() => { (window as unknown as WindowRuntime).windowFailure = null; });
  await page.getByRole("button", { name: "Dispensar aviso da janela" }).click();
  await page.getByRole("button", { name: "Preferências", exact: true }).click();
  await page.getByRole("button", { name: "Escuro", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as WindowRuntime).windowThemes)).toEqual(["dark"]);
  await expect(page.locator(".window-control-error")).toHaveCount(0);
});

test("browser retains branding with native controls hidden", async ({ page }) => {
  await page.goto("/home");
  await expect(page.locator("[data-titlebar-brand]")).toBeVisible();
  await expect(page.getByRole("group", { name: "Controles da janela" })).toBeHidden();
  await expect(page.locator("[data-app-sidebar] [data-brand]")).toHaveCount(0);
});
