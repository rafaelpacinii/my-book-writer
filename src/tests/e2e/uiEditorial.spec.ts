import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { editorialBooks } from "@/tests/e2e/editorialBooks";

const sizes = [[360, 800], [390, 844], [430, 932], [600, 960], [820, 1180],
  [1024, 768], [1366, 768], [1440, 900], [1920, 1080]];

for (const theme of ["light", "dark"]) {
  for (const [width, height] of sizes) {
    test(`@ui editorial layout ${theme} ${width}`, async ({ page }) => {
      await mockUI(page, { books: editorialBooks });
      await page.setViewportSize({ width, height });
      await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
      for (const route of ["/home", "/library"]) {
        await page.goto(route);
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(await page.locator("main").evaluate((main) => main.scrollWidth <= main.clientWidth)).toBe(true);
        if (route === "/library") {
          await expect(page.locator(".book-grid article")).toHaveCount(6);
          const proportions = await page.locator(".book-grid article").evaluateAll((cards) =>
            cards.map((card) => {
              const { width, height } = card.getBoundingClientRect();
              return height / width;
            }));
          expect(proportions.every((ratio) => ratio > 1.4)).toBe(true);
          await expect(page.getByRole("region", { name: "Retomar seu livro" })).toHaveCount(0);
        } else {
          await expect(page.getByRole("region", { name: "Retomar seu livro" })).toBeVisible();
          await expect(page.locator(".book-grid")).toHaveCount(0);
        }
        if (width === 360) {
          const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
          expect(result.violations).toEqual([]);
        }
      }
    });
  }
}

test("@ui library preserves cover identity when sorting, searching and changing view", async ({ page }) => {
  await mockUI(page, { books: editorialBooks });
  await page.goto("/library");
  const first = page.getByRole("article").filter({ has: page.getByRole("heading", { name: editorialBooks[0].title }) });
  const variant = await first.locator("[data-cover]").getAttribute("data-cover");
  await page.getByRole("button", { name: "Visualizar em lista" }).click();
  await expect(page.locator(".book-list article")).toHaveCount(6);
  await page.getByLabel("Ordenar livros").selectOption("title");
  await expect(page.getByRole("article").first().getByRole("heading")).toHaveText("A casa do outro lado");
  await page.getByLabel("Buscar por título ou autor").fill("silêncio");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(first.locator("[data-cover]")).toHaveAttribute("data-cover", variant!);
  await page.getByLabel("Buscar por título ou autor").fill("Ana Martins");
  await expect(page.getByRole("article").getByRole("heading")).toHaveText("Depois da última chuva");
  await page.getByRole("button", { name: "Visualizar em grade" }).click();
  await expect(page.locator(".book-grid article")).toHaveCount(1);
  await page.locator("summary").click();
  await expect(page.getByRole("link", { name: "Configurar livro", exact: true })).toHaveAttribute("href", /bookId=editorial-2/);
  await page.keyboard.press("Escape");
  await expect(page.locator("details")).not.toHaveAttribute("open", "");
});

test("@ui compact navigation closes on selection and Escape and restores focus", async ({ page }) => {
  await mockUI(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/home");
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Menu principal" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Biblioteca", exact: true })).toBeVisible();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("@ui long titles and authors fit both collection views", async ({ page }) => {
  await mockUI(page, { books: [{ ...editorialBooks[0], title: "Uma história " + "extraordinariamente".repeat(12), author_name: "Um nome de autor muito longo ".repeat(8) }] });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/library");
  for (const view of ["lista", "grade"]) {
    await page.getByRole("button", { name: `Visualizar em ${view}` }).click();
    expect(await page.locator("main").evaluate((main) => main.scrollWidth <= main.clientWidth)).toBe(true);
  }
});
