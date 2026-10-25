import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses, saga } from "@/tests/e2e/universeFixtures";

test("library explorer crumbs navigate across Biblioteca, Universo and sibling Series", async ({ page }) => {
  await seedUniverses(page);
  await page.addInitScript((saga) => {
    const existing = JSON.parse(localStorage.getItem("my_book_writer_series") ?? "[]");
    existing.push({ ...saga, id: "chronicles", name: "Crônicas de Aurora", position: 2 });
    localStorage.setItem("my_book_writer_series", JSON.stringify(existing));
  }, saga);
  await page.goto("/library");
  const crumbs = page.getByRole("navigation", { name: "Caminho do acervo" });
  await crumbs.getByRole("button", { name: "Ver coleções de Biblioteca", exact: true }).click();
  const rootMenu = crumbs.getByRole("region", { name: "Coleções de Biblioteca" });
  await rootMenu.getByRole("link", { name: /Aurora/ }).click();
  await expect(page).toHaveURL(/universeId=world/);
  await crumbs.getByRole("button", { name: "Ver séries de Aurora", exact: true }).click();
  const seriesMenu = crumbs.getByRole("region", { name: "Séries de Aurora" });
  await expect(seriesMenu.getByRole("link", { name: /Saga Aurora/ })).toBeVisible();
  await expect(seriesMenu.getByRole("link", { name: /Crônicas de Aurora/ })).toBeVisible();
  await seriesMenu.getByRole("link", { name: /Saga Aurora/ }).click();
  await expect(page).toHaveURL(/seriesId=saga/);
  await crumbs.getByRole("button", { name: "Ver séries de Aurora", exact: true }).click();
  await crumbs.getByRole("region", { name: "Séries de Aurora" }).getByRole("link", { name: /Crônicas de Aurora/ }).click();
  await expect(page).toHaveURL(/seriesId=chronicles/);
});

for (const theme of ["light", "dark"]) {
  for (const width of [390, 800, 1440]) {
    test(`library headers and sidebar controls stay consistent in ${theme} at ${width}`, async ({ page }, testInfo) => {
      await seedUniverses(page);
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      await page.goto("/library");
      const navigation = page.getByRole("navigation", { name: "Navegação da biblioteca" });
      const toggle = navigation.getByRole("button", { name: "Navegação e filtros", exact: true });
      if (await toggle.isVisible()) await toggle.click();
      const catalog = page.locator("[data-library-catalog]");
      await expect(catalog.getByRole("searchbox")).toHaveCount(0);
      await expect(catalog.getByRole("combobox")).toHaveCount(0);
      await expect(catalog.getByRole("group", { name: "Visualização da biblioteca" })).toBeVisible();
      await navigation.getByLabel("Buscar por título ou autor").fill("Avulso");
      await expect(catalog.getByRole("article")).toHaveCount(1);
      await navigation.getByRole("button", { name: "Limpar filtros", exact: true }).click();
      await navigation.getByLabel("Ordenar livros").selectOption("title");
      const header = page.locator("main header").first();
      const original = await header.boundingBox();
      const originalTitle = await header.locator(".editorial-heading").boundingBox();
      const crumbs = page.getByRole("navigation", { name: "Caminho do acervo" });
      for (const [route, label] of [["universeId=world", "universo"], ["seriesId=saga", "série"]]) {
        if (label === "universo") {
          await crumbs.getByRole("button", { name: "Ver coleções de Biblioteca", exact: true }).click();
          await crumbs.getByRole("region", { name: "Coleções de Biblioteca" }).getByRole("link", { name: /Aurora/ }).click();
        } else {
          await crumbs.getByRole("button", { name: "Ver séries de Aurora", exact: true }).click();
          await crumbs.getByRole("region", { name: "Séries de Aurora" }).getByRole("link", { name: /Saga Aurora/ }).click();
        }
        await expect(page).toHaveURL(new RegExp(route));
        await expect(page.getByLabel(`Nome ${label === "universo" ? "do universo" : "da série"}`, { exact: true })).toBeVisible();
        const bounds = await header.boundingBox();
        if (width > 390) expect(bounds!.height).toBeCloseTo(original!.height, 0);
        expect(bounds!.x).toBe(original!.x);
        const heading = header.locator(".editorial-heading");
        expect((await heading.boundingBox())!.y).toBeCloseTo(originalTitle!.y, 0);
        await expect(heading).toHaveCSS("font-size", width === 390 ? "28px" : "34px");
        expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
        expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        await page.screenshot({ path: `/tmp/library-${label}-${theme}-${width}-${testInfo.project.name}.png` });
      }
    });
  }
}
