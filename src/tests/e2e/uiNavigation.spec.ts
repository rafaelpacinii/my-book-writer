import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { createLibraryItem } from "@/tests/e2e/libraryActions";

test("@ui repeated navigation preserves shell, decoded covers and loaded data", async ({ page }) => {
  const image = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40"><rect width="60" height="40" fill="green"/></svg>');
  await mockUI(page, { cover: image });
  await page.goto("/home");
  await expect(page.getByRole("img", { name: "Capa de Livro de teste" })).toBeVisible();
  await page.locator("[data-app-sidebar]").evaluate((element) => element.setAttribute("data-persisted", "yes"));
  for (let pass = 0; pass < 2; pass++) {
    if (pass === 1) {
      await page.evaluate(() => {
        const runtime = window as unknown as { uiLoadingFlashes: number };
        runtime.uiLoadingFlashes = 0;
        new MutationObserver((records) => {
          for (const record of records) for (const node of record.addedNodes) {
            if (node instanceof Element && (node.matches("[data-loading-placeholder]")
              || node.querySelector("[data-loading-placeholder]"))) runtime.uiLoadingFlashes++;
          }
        }).observe(document.querySelector("main")!, { childList: true, subtree: true });
      });
    }
    for (const name of ["Biblioteca", "Novo livro", "Configurações", "Início"]) {
      const region = name === "Novo livro" ? page.locator("main") : page.getByRole("navigation", { name: "Navegação principal" });
      if (name === "Novo livro") await createLibraryItem(page, "livro");
      else await region.getByRole("link", { name, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1, name: name === "Início" ? "Bom te ver, Helena." : name, exact: true })).toBeVisible();
      await expect(page.locator('[data-persisted="yes"]')).toHaveCount(1);
      if (name === "Início" || name === "Biblioteca") {
        await expect(page.locator("[data-loading-placeholder]")).toHaveCount(0);
        await expect(page.getByRole("img", { name: "Capa de Livro de teste" })).toBeVisible();
      }
    }
  }
  expect(await page.evaluate(() => (window as unknown as { uiLoadingFlashes: number }).uiLoadingFlashes)).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { uiCalls: Record<string, number> }).uiCalls))
    .toMatchObject({ get_profile: 1, list_books: 1, read_image_data_url: 1, list_book_formats: 1 });
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: "Configurações" })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1, name: "Bom te ver, Helena." })).toBeVisible();
});

test("@ui slow loading never shows an empty library and failure offers recovery", async ({ page }) => {
  await mockUI(page, { delay: 250, failBooks: 1 });
  await page.goto("/library");
  await expect(page.locator('[aria-busy="true"]')).not.toHaveCount(0);
  await expect(page.getByText("Toda biblioteca começa", { exact: false })).toHaveCount(0);
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível carregar");
  await expect(page.locator("[data-loading-placeholder]")).toHaveCount(0);
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Livro de teste" })).toBeVisible();
});

test("@ui invalid cover finishes loading with an accessible fallback", async ({ page }) => {
  await mockUI(page, { cover: "data:image/png;base64,broken" });
  await page.goto("/library");
  await expect(page.getByRole("img", { name: "Capa indisponível: Livro de teste" })).toBeVisible();
  await expect(page.locator("[data-loading-placeholder]")).toHaveCount(0);
  await page.evaluate(() => {
    (window as unknown as { uiCover: string }).uiCover = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40"/>');
  });
  await page.getByRole("button", { name: "Recarregar capa" }).click();
  await expect(page.getByRole("img", { name: "Capa de Livro de teste" })).toBeVisible();
});

test("@ui creating a book and restoring a backup invalidate previously loaded data", async ({ page }) => {
  await mockUI(page);
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Livro de teste" })).toBeVisible();
  await createLibraryItem(page, "livro");
  await page.getByLabel("Título do livro").fill("Minha nova história");
  await page.getByRole("button", { name: "Criar livro", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Minha nova história" })).toBeVisible();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Configurações" }).click();
  await page.getByRole("button", { name: "Restaurar backup", exact: true }).click();
  await page.getByRole("button", { name: "Selecionar arquivo e restaurar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca" }).click();
  await expect(page.getByRole("heading", { name: "Livro restaurado" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Minha nova história" })).toHaveCount(0);
});
