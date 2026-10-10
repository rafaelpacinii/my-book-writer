import { book } from "@/tests/fixtures/book";
import { expect, test } from "./fixtures";

const previewURL = `/books/preview?bookId=${book.id}`;

test("preview shows the whole book page by page, read-only", async ({ page }) => {
  await page.goto(previewURL);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const navigation = page.locator("#editor-page");
  await expect.poll(() => navigation.locator("option").count()).toBeGreaterThan(1);

  await expect(page.getByText("Livro completo · somente leitura")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Sumário" })).toContainText("O começo da história");
  await expect(page.locator("[contenteditable]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "O começo da história" }).last()).toBeVisible();

  await page.getByRole("button", { name: "Próxima página" }).click();
  await expect(navigation).toHaveValue("2");
  await expect(page.getByRole("status").filter({ hasText: "Página 2 de" })).toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await expect(navigation).toHaveValue("1");
});

test("preview links lead back to the book and to PDF export", async ({ page }) => {
  await page.goto(previewURL);
  await expect(page.getByRole("link", { name: "Exportar PDF" }))
    .toHaveAttribute("href", `/books/export?bookId=${book.id}`);
  await expect(page.getByRole("link", { name: "Voltar ao livro" }))
    .toHaveAttribute("href", `/books/view?bookId=${book.id}`);
});

test("preview of a missing book offers a way back", async ({ page }) => {
  await page.goto("/books/preview?bookId=does-not-exist");
  await expect(page.getByText("Livro não encontrado.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar à biblioteca" })).toBeVisible();
});

test("preview scrubber allows page navigation with Kindle-style slider", async ({ page }) => {
  await page.goto(previewURL);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.locator("article").first().hover();
  const slider = page.getByRole("slider", { name: "Barra de progresso de páginas do livro" });
  await expect(slider).toBeVisible();
  await expect(slider).toHaveValue("1");

  await slider.fill("2");
  await expect(page.locator("#editor-page")).toHaveValue("2");
  await expect(page.getByRole("status").filter({ hasText: "Página 2 de" })).toBeVisible();
});

test("preview zoom controls support fit width, fit height, and manual percentage", async ({ page }) => {
  await page.goto(previewURL);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const fitWidthBtn = page.getByRole("button", { name: "Largura" });
  const fitHeightBtn = page.getByRole("button", { name: "Altura" });
  const zoomInBtn = page.getByRole("button", { name: "Aumentar zoom" });
  const zoomOutBtn = page.getByRole("button", { name: "Reduzir zoom" });

  await expect(fitWidthBtn).toBeVisible();
  await expect(fitHeightBtn).toBeVisible();

  await fitWidthBtn.click();
  await expect(fitWidthBtn).toHaveClass(/bg-primary/);

  await fitHeightBtn.click();
  await expect(fitHeightBtn).toHaveClass(/bg-primary/);

  await zoomInBtn.click();
  await zoomOutBtn.click();
  const resetBtn = page.getByRole("button", { name: "Redefinir para 100%" });
  await resetBtn.click();
  await expect(resetBtn).toContainText("100%");
});