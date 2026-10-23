import { test, expect } from "@/tests/e2e/fixtures";

for (const theme of ["light", "dark"]) {
  test(`@ui ${theme} sidebar renders the official mark before hydration and keeps it legible when collapsed`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    let release!: () => void;
    const hydration = new Promise<void>((resolve) => { release = resolve; });
    await page.route(/\/_next\/static\/.*\.js/, async (route) => { await hydration; await route.fallback(); });
    try {
      await page.goto("/home", { waitUntil: "commit" });
      const brand = page.locator("[data-sidebar-brand] [data-brand=horizontal]");
      await expect(brand).toBeVisible();
      await expect(brand).toBeInViewport({ ratio: 1 });
      await expect(brand).toHaveCSS("height", "48px");
      await expect(brand.locator(theme === "dark" ? ".brand-dark" : ".brand-light")).toBeVisible();
      await expect(brand.locator(theme === "dark" ? ".brand-light" : ".brand-dark")).toBeHidden();
    } finally { release(); }
    await page.waitForLoadState("load");
    const header = page.locator("[data-sidebar-header]");
    const expandedHeight = (await header.boundingBox())!.height;
    await page.getByRole("button", { name: "Recolher menu", exact: true }).click();
    await expect(page.locator("[data-app-sidebar]")).toHaveCSS("width", "80px");
    const brandLink = page.getByRole("link", { name: "My Book Writer — início", exact: true });
    await expect(brandLink.locator("[data-brand=horizontal]")).toBeHidden();
    await expect(brandLink.locator("[data-brand=symbol]")).toHaveCSS("height", "48px");
    expect((await header.boundingBox())!.height).toBe(expandedHeight);
    await expect(brandLink.getByRole("img", { name: "My Book Writer", exact: true })).toBeInViewport({ ratio: 1 });
    await page.reload();
    await expect(brandLink.locator("[data-brand=symbol]")).toBeVisible();
    await page.getByRole("button", { name: "Expandir menu", exact: true }).click();
    await expect(brandLink.locator("[data-brand=horizontal]")).toBeVisible();
    await expect(brandLink.getByRole("img", { name: "My Book Writer", exact: true })).toHaveCount(1);
    await page.getByRole("button", { name: "Recolher menu", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 600 });
    await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
    await expect(brandLink.locator("[data-brand=horizontal]")).toBeInViewport({ ratio: 1 });
    await brandLink.click();
    await expect(page).toHaveURL(/\/home$/);
  });

  test(`@ui ${theme} onboarding uses approved logo sizes and changes variants with theme`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/auth");
    const header = page.locator("header");
    const horizontal = header.locator("[data-brand=horizontal]");
    await expect(horizontal).toBeVisible();
    await expect(horizontal).toHaveCSS("width", "320px");
    await expect(header.getByRole("img", { name: "My Book Writer", exact: true })).toHaveCount(1);
    await page.getByRole("button", { name: /^Alternar para tema/ }).click();
    await expect(horizontal.locator(theme === "dark" ? ".brand-light" : ".brand-dark")).toBeVisible();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(horizontal).toBeHidden();
      await expect(header.locator("[data-brand=stacked]")).toBeVisible();
      await expect(header.locator("[data-brand=stacked]")).toHaveCSS("width", "220px");
      expect(await header.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await expect(page.getByRole("button", { name: "Continuar offline", exact: true })).toBeVisible();
    }
  });
}

test("@ui browser metadata references decodable local brand icons and an install manifest", async ({ page }) => {
  await page.goto("/library");
  await expect(page).toHaveTitle("My Book Writer");
  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute("content", "My Book Writer");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBe("/site.webmanifest");
  const response = await page.request.get(manifestHref!);
  const manifest: { name: string; icons: { src: string; sizes: string }[] } = await response.json();
  expect(manifest.name).toBe("My Book Writer");
  const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  for (const src of [...icons, ...manifest.icons.map((icon) => icon.src)]) {
    const asset = await page.request.get(src);
    expect(asset.ok(), src).toBe(true);
    expect(new URL(src, page.url()).origin).toBe(new URL(page.url()).origin);
    expect(await page.evaluate((src) => new Promise<boolean>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
      image.onerror = () => resolve(false);
      image.src = src;
    }), src), src).toBe(true);
  }
});
