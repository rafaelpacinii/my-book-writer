import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import { exportURL, mockExportDesktop, type ExportRuntime } from "./exportDesktop";

for (const format of ["PDF", "EPUB", "DOCX"]) {
  test(`${format}: browser explains desktop requirement and disables export`, async ({ page }) => {
    await page.goto(exportURL);
    await page.getByRole("tab", { name: format, exact: true }).click();
    await expect(page.getByRole("button", { name: `Exportar ${format}` })).toBeDisabled();
    await expect(page.getByText("A exportação está disponível no aplicativo desktop.")).toBeVisible();
  });

  test(`${format}: an empty chapter is named and linked before opening the save dialog`, async ({ page }) => {
    await mockExportDesktop(page, "empty-chapter");
    await page.goto(exportURL);
    await page.getByRole("tab", { name: format, exact: true }).click();
    await expect(page.getByText(/O capítulo 1.*está vazio/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir capítulo", exact: true })).toHaveAttribute("href", `/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
    await expect(page.getByRole("button", { name: `Exportar ${format}` })).toBeDisabled();
    expect(await page.evaluate(() => (window as unknown as ExportRuntime).exportCalls)).toEqual([]);
  });

  test(`${format}: cancellation allows a fresh export without a success message`, async ({ page }) => {
    await mockExportDesktop(page, "cancel");
    await page.goto(exportURL);
    await page.getByRole("tab", { name: format, exact: true }).click();
    await page.getByRole("button", { name: `Exportar ${format}` }).click();
    await expect(page.getByText("Exportação cancelada. Nenhum arquivo foi salvo.")).toBeVisible();
    await expect(page.getByRole("button", { name: `Exportar ${format}` })).toBeEnabled();
    await expect(page.getByText("Arquivo salvo em:")).toHaveCount(0);
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  });
}

test("fixing a chapter and rechecking makes all formats available", async ({ page }) => {
  await mockExportDesktop(page, "empty-chapter");
  await page.goto(exportURL);
  await expect(page.getByRole("heading", { name: "Ajustes necessários para exportar" })).toBeVisible();
  await page.evaluate(() => { (window as unknown as ExportRuntime).exportIssue = false; });
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Ajustes necessários para exportar" })).toHaveCount(0);
  for (const format of ["PDF", "EPUB", "DOCX"]) {
    await page.getByRole("tab", { name: format, exact: true }).click();
    await page.getByRole("button", { name: `Exportar ${format}` }).click();
    await expect(page.getByRole("status")).toContainText(`Arquivo salvo em: /livros/Livro.${format.toLowerCase()}`);
  }
});

test("a single operation locks every format even when switching tabs", async ({ page }) => {
  await mockExportDesktop(page, "slow");
  await page.goto(exportURL);
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await page.getByRole("tab", { name: "EPUB", exact: true }).click();
  await expect(page.getByRole("button", { name: "Exportar EPUB" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("PDF");
  await page.getByRole("tab", { name: "DOCX", exact: true }).click();
  await expect(page.getByRole("button", { name: "Exportar DOCX" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Arquivo salvo em: /livros/Livro.pdf");
  expect(await page.evaluate(() => (window as unknown as ExportRuntime).exportCalls)).toEqual(["export_book_pdf"]);
});

test("preflight rereads saved data before exporting", async ({ page }) => {
  await mockExportDesktop(page);
  await page.goto(exportURL);
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeEnabled();
  await page.evaluate(() => { (window as unknown as ExportRuntime).exportIssue = true; });
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("está vazio");
  expect(await page.evaluate(() => (window as unknown as ExportRuntime).exportCalls)).toEqual([]);
});

for (const mode of ["error", "unknown-error"]) {
  test(`recoverable ${mode} is readable and retry succeeds`, async ({ page }) => {
    await mockExportDesktop(page, mode);
    await page.goto(exportURL);
    await page.getByRole("tab", { name: "DOCX", exact: true }).click();
    await page.getByRole("button", { name: "Exportar DOCX" }).click();
    await expect(page.locator("main").getByRole("alert")).toContainText(mode === "error" ? "A pasta escolhida" : "Tente novamente");
    await expect(page.locator("main").getByRole("alert")).not.toContainText("[object Object]");
    await page.evaluate(() => { (window as unknown as ExportRuntime).exportMode = "success"; });
    await page.getByRole("button", { name: "Exportar DOCX" }).click();
    await expect(page.getByRole("status")).toContainText("Livro.docx");
  });
}

test("load errors allow retry and a missing book parameter is explicit", async ({ page }) => {
  await mockExportDesktop(page, "load-error");
  await page.goto(exportURL);
  await expect(page.locator("main").getByRole("alert")).toContainText("ler os dados");
  await page.evaluate(() => { (window as unknown as ExportRuntime).exportMode = "success"; });
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeEnabled();
  await page.goto("/books/export");
  await expect(page.locator("main").getByRole("alert")).toContainText("Selecione um livro");
});

test("Chromium availability affects only PDF and metadata failures retain success", async ({ page }) => {
  await mockExportDesktop(page, "missing-chromium");
  await page.goto(exportURL);
  await expect(page.getByRole("button", { name: "Exportar PDF" })).toBeDisabled();
  await page.getByRole("tab", { name: "DOCX", exact: true }).click();
  await expect(page.getByRole("button", { name: "Exportar DOCX" })).toBeEnabled();
  await page.evaluate(() => { (window as unknown as ExportRuntime).exportMode = "metadata-error"; });
  await page.getByRole("button", { name: "Exportar DOCX" }).click();
  await expect(page.getByRole("status")).toContainText("Arquivo salvo em:");
  await expect(page.locator("main").getByRole("alert")).toContainText("O arquivo foi salvo");
});

test("late book info and export results do not leak into another book", async ({ page }) => {
  await mockExportDesktop(page, "slow-load");
  await page.goto(exportURL);
  await page.evaluate(() => window.history.pushState({}, "", "/books/export?bookId=other"));
  await expect(page.getByRole("tabpanel")).toContainText("Outro livro");
  await page.waitForTimeout(750);
  await expect(page.getByRole("tabpanel")).toContainText("Outro livro");
  await page.evaluate(() => { (window as unknown as ExportRuntime).exportMode = "slow"; });
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as ExportRuntime).exportCalls.length)).toBe(1);
  await page.evaluate((url) => window.history.pushState({}, "", url), exportURL);
  await expect(page.getByRole("tabpanel")).toContainText(book.title);
  await page.waitForTimeout(1000);
  await expect(page.getByText("Arquivo salvo em:")).toHaveCount(0);
});

for (const theme of ["light", "dark"]) {
  test(`export feedback is accessible at 800×600 in ${theme} theme`, async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await mockExportDesktop(page, "empty-chapter");
    await page.goto(exportURL);
    await expect(page.getByRole("heading", { name: "Ajustes necessários para exportar" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("tab", { name: "PDF", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "EPUB", exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`export-feedback-${theme}.png`), fullPage: true });
    expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
  });
}
