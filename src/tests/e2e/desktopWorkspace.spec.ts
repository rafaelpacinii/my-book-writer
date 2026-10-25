import type { Page } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses, world } from "@/tests/e2e/universeFixtures";
import type { CodexEntity } from "@/types/codex";
import type { CodexStore } from "@/lib/codex/storage";

async function seedDesktop(page: Page) {
  await seedUniverses(page);
  const entities: CodexEntity[] = Array.from({ length: 18 }, (_, index) => ({
    id: `desktop-person-${index}`, profile_id: world.profile_id, book_id: null, universe_id: world.id,
    kind: "character", name: `Personagem de Aurora ${index + 1}`, summary: "Uma história a desenvolver.",
    role: "Viajante", status: "Em jornada", archetype: null, tags_json: "[]", position: index,
    created_at: world.created_at, updated_at: world.updated_at, deleted_at: null,
  }));
  const store: CodexStore = { version: 1, entities, categories: [], fields: [], images: [],
    templates: [], contexts: [], assets: [] };
  await page.addInitScript((store) => {
    if (!localStorage.getItem("my_book_writer_codex_v1")) {
      localStorage.setItem("my_book_writer_codex_v1", JSON.stringify(store));
    }
  }, store);
}

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
        const headings = [];
        const grids: number[][] = [];
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
          headings.push(await page.getByRole("heading", { level: 1 }).evaluate((heading) => {
            const style = getComputedStyle(heading);
            return { font: style.fontFamily, size: style.fontSize, weight: style.fontWeight,
              lineHeight: style.lineHeight, left: heading.getBoundingClientRect().left };
          }));
          if (route !== "/home") {
            const grid = page.locator(route === "/library" ? ".book-grid" : ".workspace-grid").first();
            grids.push(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").map(parseFloat)));
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
        expect(headings[1]).toEqual(headings[0]);
        expect(headings[2]).toEqual(headings[0]);
        expect(grids[1]).toHaveLength(grids[0].length);
        grids[1].forEach((column, index) => expect(column).toBeCloseTo(grids[0][index], 1));
      }
    });
  }
}
