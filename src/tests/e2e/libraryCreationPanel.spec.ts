import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses } from "@/tests/e2e/universeFixtures";

test("creation card stays first across sort, search, grouped and list views, without entering item counts", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/library");
  const catalog = page.locator("[data-library-catalog]");
  await expect(page.locator("main header").first().getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Todo o acervo", exact: true })).toHaveCount(0);
  await expect(catalog.getByRole("heading", { name: "Seu acervo", exact: true })).toHaveText("Seu acervo (3 itens)");
  await expect(catalog.getByRole("navigation", { name: "Caminho do acervo" }).getByRole("link", { name: "Biblioteca", exact: true })).toHaveAttribute("aria-current", "page");
  const first = catalog.locator(".book-grid > *, .book-list > *").first();
  await expect(first).toHaveAttribute("data-library-create-card", "true");
  const creation = page.getByRole("button", { name: "Criar na biblioteca", exact: true });
  const card = catalog.getByRole("article").first();
  expect((await creation.boundingBox())!.width).toBeCloseTo((await card.boundingBox())!.width, 0);
  expect((await creation.boundingBox())!.height).toBeCloseTo((await card.boundingBox())!.height, 0);
  await page.getByLabel("Ordenar livros").selectOption("title");
  await expect(first).toHaveAttribute("data-library-create-card", "true");
  await page.getByLabel("Buscar por título ou autor").fill("Avulso");
  await expect(catalog.getByRole("heading", { name: "Seu acervo", exact: true })).toHaveText("Seu acervo (1 item)");
  await page.getByRole("button", { name: "Visualizar em lista" }).click();
  await expect(first).toHaveAttribute("data-library-create-card", "true");
  await page.getByLabel("Buscar por título ou autor").fill("não existe");
  await expect(creation).toBeEnabled();
  await expect(catalog.getByRole("heading", { name: "Seu acervo", exact: true })).toHaveText("Seu acervo (0 itens)");
  await page.getByLabel("Buscar por título ou autor").clear();
  await expect(catalog.locator("[data-library-create-card]")).toHaveCount(1);
  await expect(first).toHaveAttribute("data-library-create-card", "true");
  await page.goto("/library?seriesId=saga");
  await page.getByRole("button", { name: "Visualizar em grade" }).click();
  await expect(first).toHaveAttribute("data-library-create-card", "true");
  expect((await creation.boundingBox())!.height).toBeCloseTo((await card.boundingBox())!.height, 0);
});

test("unified sidebar omits tree headings, divider borders and filter headings", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/library");
  const navigation = page.getByRole("navigation", { name: "Navegação da biblioteca" });
  for (const removed of ["Biblioteca", "Universos", "Séries independentes", "Livros avulsos", "Filtros", "Formato", "Ordenação", "Agrupamento"]) {
    await expect(navigation.getByRole("heading", { name: removed, exact: true })).toHaveCount(0);
    await expect(navigation.locator("label", { hasText: removed })).toHaveCount(0);
  }
  const filters = navigation.getByRole("region", { name: "Filtros da biblioteca" });
  await expect(filters).toHaveCSS("border-top-width", "0px");
});

for (const width of [320, 390, 800, 1440]) {
  test(`type selector occupies one row at the top of the navigation at ${width}`, async ({ page }) => {
    await seedUniverses(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/library");
    const navigation = page.getByRole("navigation", { name: "Navegação da biblioteca" });
    const expand = navigation.getByRole("button", { name: "Navegação e filtros", exact: true });
    if (await expand.isVisible()) await expand.click();
    const types = navigation.getByRole("group", { name: "Filtrar por tipo" });
    await expect(types.getByRole("button")).toHaveCount(4);
    const rows = await types.getByRole("button").evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));
    expect(new Set(rows).size).toBe(1);
    expect((await types.boundingBox())!.y).toBeLessThan((await navigation.getByLabel("Buscar por título ou autor").boundingBox())!.y);
    expect(await navigation.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  });
}
